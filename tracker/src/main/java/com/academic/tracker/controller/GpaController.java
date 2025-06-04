package com.academic.tracker.controller;

import com.academic.tracker.service.GpaService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/gpa")
public class GpaController {

    private final GpaService gpaService;

    public GpaController(GpaService gpaService) {
        this.gpaService = gpaService;
    }

    @GetMapping("/sgpa/{semester}")
    public double getSgpa(@PathVariable int semester) {
        return gpaService.calculateSgpa(semester);
    }
}