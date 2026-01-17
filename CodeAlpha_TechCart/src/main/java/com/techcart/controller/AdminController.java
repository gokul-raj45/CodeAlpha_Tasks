package com.techcart.controller;

import com.techcart.model.Product;
import com.techcart.model.User;
import com.techcart.service.ProductService;
import com.techcart.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/admin")
public class AdminController {

    private final ProductService productService;
    private final UserService userService;

    @Autowired
    public AdminController(ProductService productService, UserService userService) {
        this.productService = productService;
        this.userService = userService;
    }

    // Helper method to check admin authentication
    private boolean isAdmin(HttpSession session) {
        User user = (User) session.getAttribute("user");
        return user != null && user.isAdmin();
    }

    // Admin dashboard
    @GetMapping("/dashboard")
    public String dashboard(Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("error", "Access denied! Admin login required.");
            return "redirect:/login";
        }
        model.addAttribute("productCount", productService.getAllProducts().size());
        model.addAttribute("userCount", userService.getAllUsers().size());
        return "admin/dashboard";
    }

    // Admin page to add products
    @GetMapping("/add-product")
    public String showAddProductForm(Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("error", "Access denied! Admin login required.");
            return "redirect:/login";
        }
        model.addAttribute("product", new Product());
        return "admin/add-product";
    }

    // Add new product
    @PostMapping("/add-product")
    public String addProduct(@ModelAttribute Product product, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("error", "Access denied! Admin login required.");
            return "redirect:/login";
        }
        productService.saveProduct(product);
        redirectAttributes.addFlashAttribute("success", "Product added successfully!");
        return "redirect:/admin/dashboard";
    }

    // Delete product
    @GetMapping("/delete/{id}")
    public String deleteProduct(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("error", "Access denied! Admin login required.");
            return "redirect:/login";
        }
        productService.deleteProduct(id);
        redirectAttributes.addFlashAttribute("success", "Product deleted successfully!");
        return "redirect:/";
    }

    // Manage users
    @GetMapping("/users")
    public String manageUsers(Model model, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("error", "Access denied! Admin login required.");
            return "redirect:/login";
        }
        List<User> users = userService.getAllUsers();
        model.addAttribute("users", users);
        return "admin/users";
    }

    // Delete user
    @GetMapping("/users/delete/{id}")
    public String deleteUser(@PathVariable Long id, HttpSession session, RedirectAttributes redirectAttributes) {
        if (!isAdmin(session)) {
            redirectAttributes.addFlashAttribute("error", "Access denied! Admin login required.");
            return "redirect:/login";
        }
        userService.deleteUser(id);
        redirectAttributes.addFlashAttribute("success", "User deleted successfully!");
        return "redirect:/admin/users";
    }
}
