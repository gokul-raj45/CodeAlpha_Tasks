package com.techcart.controller;

import com.techcart.model.User;
import com.techcart.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    // Show login page
    @GetMapping("/login")
    public String showLoginPage(Model model, HttpSession session) {
        // If already logged in, redirect
        if (session.getAttribute("user") != null) {
            return "redirect:/";
        }
        return "login";
    }

    // Handle login
    @PostMapping("/login")
    public String login(@RequestParam String username,
                       @RequestParam String password,
                       HttpSession session,
                       RedirectAttributes redirectAttributes) {
        Optional<User> user = userService.authenticate(username, password);
        
        if (user.isPresent()) {
            session.setAttribute("user", user.get());
            session.setAttribute("username", user.get().getUsername());
            session.setAttribute("role", user.get().getRole());
            session.setAttribute("isAdmin", user.get().isAdmin());
            
            if (user.get().isAdmin()) {
                return "redirect:/admin/dashboard";
            } else {
                return "redirect:/";
            }
        } else {
            redirectAttributes.addFlashAttribute("error", "Invalid username or password!");
            return "redirect:/login";
        }
    }

    // Handle logout
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login?logout=true";
    }

    // Show register page
    @GetMapping("/register")
    public String showRegisterPage(Model model) {
        model.addAttribute("user", new User());
        return "register";
    }

    // Handle registration
    @PostMapping("/register")
    public String register(@ModelAttribute User user,
                          RedirectAttributes redirectAttributes) {
        try {
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("USER");
            }
            userService.createUser(user);
            redirectAttributes.addFlashAttribute("success", "Registration successful! Please login.");
            return "redirect:/login";
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/register";
        }
    }
}
