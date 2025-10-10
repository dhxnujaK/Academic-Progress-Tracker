package com.academic.tracker.controller;

import com.academic.tracker.dto.UserProfileResponse;
import com.academic.tracker.dto.UserProfileUpdateRequest;
import com.academic.tracker.model.User;
import com.academic.tracker.repository.UserRepository;
import com.academic.tracker.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;

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
@RequestMapping("/api/users/profile")
public class ProfileController {
    private final UserRepository userRepo;
    public ProfileController(UserRepository userRepo) { this.userRepo = userRepo; }

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @GetMapping
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal CustomUserDetails principal) {
        User u = userRepo.findById(principal.getId()).orElseThrow();
        return ResponseEntity.ok(toResponse(u));
    }

    @PutMapping
    public ResponseEntity<UserProfileResponse> update(@AuthenticationPrincipal CustomUserDetails principal,
                                                      @RequestBody @Valid UserProfileUpdateRequest req) {
        User u = userRepo.findById(principal.getId()).orElseThrow();

        if (!u.getEmail().equalsIgnoreCase(req.getEmail()) && userRepo.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }
        if (!u.getUsername().equalsIgnoreCase(req.getUsername()) && userRepo.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }

        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setUsername(req.getUsername());
        u.setUniversity(req.getUniversity());
        if (req.getAcademicYear() != null) u.setAcademicYear(req.getAcademicYear());
        u.setDegree(req.getDegree());
        if (req.getGraduationYear() != null) u.setGraduationYear(req.getGraduationYear());
        u.setBatch(req.getBatch());
        u.setUniversityRegNumber(req.getUniversityRegNumber());
        u.setAlYear(req.getAlYear());
        u.setTelephone(req.getTelephone());
        u.setDob(req.getDob());

        userRepo.save(u);
        return ResponseEntity.ok(toResponse(u));
    }

    @PostMapping(path = "/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponse> uploadPicture(@AuthenticationPrincipal CustomUserDetails principal,
                                                             @RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) Files.createDirectories(dir);
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String safeExt = (ext != null && ext.matches("[A-Za-z0-9]+")) ? ("." + ext) : "";
        String filename = "u" + principal.getId() + "_" + System.currentTimeMillis() + safeExt;
        Path dest = dir.resolve(filename).normalize();
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        User u = userRepo.findById(principal.getId()).orElseThrow();
        u.setProfilePictureUrl("/uploads/" + filename);
        userRepo.save(u);
        return ResponseEntity.ok(toResponse(u));
    }

    private static UserProfileResponse toResponse(User u) {
        UserProfileResponse r = new UserProfileResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setEmail(u.getEmail());
        r.setName(u.getName());
        r.setUniversity(u.getUniversity());
        r.setAcademicYear(u.getAcademicYear());
        r.setDegree(u.getDegree());
        r.setGraduationYear(u.getGraduationYear());
        r.setProfilePictureUrl(u.getProfilePictureUrl());
        r.setTelephone(u.getTelephone());
        r.setDob(u.getDob());
        r.setBatch(u.getBatch());
        r.setUniversityRegNumber(u.getUniversityRegNumber());
        r.setAlYear(u.getAlYear());
        return r;
    }
}
