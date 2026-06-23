package com.project.cart.service;

import com.project.auth.entity.User;
import com.project.cart.dto.CartItemRequest;
import com.project.cart.dto.CartItemResponse;
import com.project.cart.entity.CartItem;
import com.project.cart.repository.CartItemRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CartItemResponse> getCartItems(User user) {
        return cartItemRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(item -> new CartItemResponse(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getImageUrl(),
                        item.getProduct().getPrice(),
                        item.getQuantity()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItemResponse addToCart(User user, CartItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay san pham"));

        CartItem cartItem = cartItemRepository.findByUserAndProductId(user, product.getId())
                .orElseGet(() -> new CartItem(user, product, 0));

        cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        cartItemRepository.save(cartItem);

        return new CartItemResponse(
                cartItem.getId(),
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice(),
                cartItem.getQuantity()
        );
    }

    @Transactional
    public void removeFromCart(User user, Long productId) {
        cartItemRepository.findByUserAndProductId(user, productId)
                .ifPresent(cartItemRepository::delete);
    }

    @Transactional
    public void updateQuantity(User user, CartItemRequest request) {
        if (request.getQuantity() <= 0) {
            removeFromCart(user, request.getProductId());
            return;
        }

        CartItem cartItem = cartItemRepository.findByUserAndProductId(user, request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Khong co san pham trong gio hang"));
        
        cartItem.setQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);
    }

    @Transactional
    public void clearCart(User user) {
        cartItemRepository.deleteByUser(user);
    }
}
