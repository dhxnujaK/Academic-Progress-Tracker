package com.academic.tracker.service;

import com.academic.tracker.model.User;
import com.academic.tracker.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder; 
import java.util.Optional;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder; 

    public UserService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
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
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }

        require(user.getName(), "name");
        require(user.getUsername(), "username");
        require(user.getEmail(), "email");
        require(user.getPassword(), "password");
        require(user.getBatch(), "batch");
        require(user.getUniversityRegNumber(), "universityRegNumber");
        require(user.getAlYear(), "alYear");

        if (userRepo.existsByEmail(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use.");
        }
        if (userRepo.existsByUsername(user.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken.");
        }
        if (userRepo.existsByUniversityRegNumber(user.getUniversityRegNumber())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "University registration number already in use.");
        }

        if (user.getRole() == null) {
            user.setRole(User.Role.STUDENT);
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return "User registered successfully.";
    }

    private void require(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " is required");
        }
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
