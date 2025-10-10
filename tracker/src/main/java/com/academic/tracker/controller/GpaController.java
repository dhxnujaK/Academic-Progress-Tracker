package com.academic.tracker.controller;

import com.academic.tracker.security.CustomUserDetails;
import com.academic.tracker.service.GpaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
@RequestMapping("/api/grades")
public class GpaController {
    private final GpaService gpa;
    public GpaController(GpaService gpa) { this.gpa = gpa; }

    @GetMapping("/overview")
    public ResponseEntity<?> overview(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(gpa.overview(principal.getId()));
    }
}
