package com.build.trustpay.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Phase 3 — Real-time push notifications via STOMP over SockJS.
 *
 * Clients subscribe to:
 *   /topic/escrows          → broadcast on any escrow change
 *   /topic/escrows/{id}     → targeted update for a specific escrow
 *
 * Backend sends with:
 *   messagingTemplate.convertAndSend("/topic/escrows", payload);
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // SockJS fallback endpoint — frontend connects to ws://host:8080/ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // Simple in-memory broker for /topic/* subscriptions
        registry.enableSimpleBroker("/topic");
        // Prefix for messages routed to @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
    }
}
