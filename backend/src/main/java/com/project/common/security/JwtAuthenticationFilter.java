package com.project.common.security;

import com.project.auth.repository.UserRepository;
import com.project.auth.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Objects;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final com.project.auth.service.JwtBlacklistService blacklistService;
    private final UserRepository userRepository;
    private final CacheManager cacheManager;

    private static final String TOKEN_VERSION_CACHE = "tokenVersion";

    public JwtAuthenticationFilter(JwtService jwtService,
                                   UserDetailsService userDetailsService,
                                   com.project.auth.service.JwtBlacklistService blacklistService,
                                   UserRepository userRepository,
                                   CacheManager cacheManager) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.blacklistService = blacklistService;
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            // Kiểm tra JWT có trong blacklist không (logout)
            if (blacklistService.isBlacklisted(jwt)) {
                throw new io.jsonwebtoken.JwtException("error.auth.token_blacklisted");
            }

            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    // [FIX] Kiểm tra tokenVersion với cache L1 để tránh DB call mỗi request
                    int jwtTokenVersion = jwtService.extractTokenVersion(jwt);
                    int userTokenVersion = getCachedTokenVersion(userEmail);

                    if (jwtTokenVersion < userTokenVersion) {
                        // JWT bị thu hồi — đổi mật khẩu đã xảy ra sau khi JWT được cấp
                        SecurityContextHolder.clearContext();
                        filterChain.doFilter(request, response);
                        return;
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Lấy tokenVersion của user từ Caffeine cache (L1) trước, fallback DB (L2).
     * Cache TTL = 5 phút — đủ nhanh và đủ an toàn (window thu hồi tối đa 5 phút).
     */
    private int getCachedTokenVersion(String email) {
        Cache cache = cacheManager.getCache(TOKEN_VERSION_CACHE);
        if (cache != null) {
            Cache.ValueWrapper cached = cache.get(email);
            if (cached != null) {
                return Objects.requireNonNullElse((Integer) cached.get(), 0);
            }
        }

        // Cache miss → truy vấn DB và warm cache
        int version = userRepository.findByEmail(email)
                .map(com.project.auth.entity.User::getTokenVersion)
                .orElse(0);

        if (cache != null) {
            cache.put(email, version);
        }
        return version;
    }
}
