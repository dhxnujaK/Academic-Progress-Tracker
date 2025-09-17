package com.academic.tracker.controller;

import com.academic.tracker.security.CustomUserDetails;
import com.academic.tracker.service.GpaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/grades")
public class GpaController {
    private final GpaService gpa;
    public GpaController(GpaService gpa) { this.gpa = gpa; }

    @GetMapping("/overview")
    public ResponseEntity<?> overview(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(gpa.overview(principal.getId()));
    }
}

