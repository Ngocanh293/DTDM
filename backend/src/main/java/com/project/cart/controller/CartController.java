package com.project.cart.controller;

import com.project.cart.dto.CartItemRequest;
import com.project.cart.dto.CartItemResponse;
import com.project.cart.service.CartService;
import com.project.common.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final MessageSource messageSource;

    public CartController(CartService cartService, MessageSource messageSource) {
        this.cartService = cartService;
        this.messageSource = messageSource;
    }

    private String translate(String key) {
        try {
            return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
        } catch (org.springframework.context.NoSuchMessageException e) {
            return key;
        }
    }

    @GetMapping
    public ResponseEntity<List<CartItemResponse>> getCartItems(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCartItems(userDetails.getUser()));
    }

    @PostMapping("/add")
    public ResponseEntity<CartItemResponse> addToCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getUser(), request));
    }

    @PutMapping("/update")
    public ResponseEntity<String> updateQuantity(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CartItemRequest request) {
        cartService.updateQuantity(userDetails.getUser(), request);
        return ResponseEntity.ok(translate("success.cart.updated"));
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<String> removeFromCart(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long productId) {
        cartService.removeFromCart(userDetails.getUser(), productId);
        return ResponseEntity.ok(translate("success.cart.removed"));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart(@AuthenticationPrincipal CustomUserDetails userDetails) {
        cartService.clearCart(userDetails.getUser());
        return ResponseEntity.ok(translate("success.cart.cleared"));
    }
}
