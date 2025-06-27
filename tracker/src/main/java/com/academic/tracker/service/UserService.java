package com.academic.tracker.service;

import com.academic.tracker.model.User;
import com.academic.tracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepo, BCryptPasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    public User createUser(User user) {
        return userRepo.save(user);
    }

    public User getUserById(Long id) {
        return userRepo.findById(id).orElse(null);
    }

    public String registerUser(User user) {
        if (userRepo.existsByEmail(user.getEmail())) {
            return "Email already in use.";
        }
        if (userRepo.existsByUsername(user.getUsername())) {
            return "Username already taken.";
        }
        // Ensure a valid role is set (default to USER if not provided)
        if (user.getRole() == null) {
            user.setRole(User.Role.STUDENT);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return "User registered successfully.";
    }

    public Optional<User> authenticateUser(String emailOrUsername, String password) {
        Optional<User> userOpt = userRepo.findByEmail(emailOrUsername);
        if (userOpt.isEmpty()) {
            userOpt = userRepo.findByUsername(emailOrUsername);
        }
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }
}