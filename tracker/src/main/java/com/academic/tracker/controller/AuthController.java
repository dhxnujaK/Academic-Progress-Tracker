package com.academic.tracker.controller;

import com.academic.tracker.model.User;
import com.academic.tracker.dto.JwtAuthResponse;
import com.academic.tracker.security.JwtService;
import com.academic.tracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseBody;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(
        origins = {
                "https://trackmateacademictracker.netlify.app",
                "http://localhost:3000",
                "http://localhost:5173"
        },
        allowCredentials = "true"
)
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return userService.registerUser(user);
    }

    @PostMapping("/login")
    @ResponseBody
    public JwtAuthResponse login(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier"); // email or username
        String password = request.get("password");

        Optional<User> user = userService.authenticateUser(identifier, password);
        if (user.isPresent()) {
            String token = jwtService.generateToken(user.get());
            return new JwtAuthResponse(token, user.get().getUsername(), user.get().getRole().name());
        } else {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid credentials.");
        }
    }
}
