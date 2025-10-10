package com.academic.tracker.controller;

import com.academic.tracker.model.User;
import com.academic.tracker.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(
        origins = {
                "https://trackmateacademictracker.netlify.app",
                "http://localhost:3000",
                "http://localhost:5173"
        },
        originPatterns = {
                "https://*.netlify.app"
        },
        allowCredentials = "true"
)
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
