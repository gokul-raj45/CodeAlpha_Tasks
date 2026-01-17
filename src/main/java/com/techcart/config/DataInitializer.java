package com.techcart.config;

import com.techcart.model.User;
import com.techcart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Autowired
    public DataInitializer(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // Create default admin user if it doesn't exist
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin123", "ADMIN", "admin@techcart.com");
            userRepository.save(admin);
            System.out.println("Default admin user created: username=admin, password=admin123");
        }

        // Create a test user if it doesn't exist
        if (!userRepository.existsByUsername("user")) {
            User user = new User("user", "user123", "USER", "user@techcart.com");
            userRepository.save(user);
            System.out.println("Default user created: username=user, password=user123");
        }
    }
}
