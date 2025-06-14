
package com.academic.tracker.controller;

import com.academic.tracker.model.Semester;
import com.academic.tracker.service.SemesterService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    public SemesterController(SemesterService semesterService) {
        this.semesterService = semesterService;
    }

    @GetMapping
    public List<Semester> getSemesters(@RequestParam Long userId) {
        return semesterService.getSemestersByUserId(userId);
    }

    @PostMapping
    public Semester createSemester(@Valid @RequestBody Semester semester) {
        List<Semester> existing = semesterService.getSemestersByUserId(semester.getUser().getId());
        String normalizedNew = normalize(semester.getName());

        for (Semester s : existing) {
            if (normalize(s.getName()).equals(normalizedNew)) {
                throw new IllegalArgumentException("Semester name or number already exists for this user.");
            }
        }
        return semesterService.saveSemester(semester);
    }

    private String normalize(String input) {
        input = input.toLowerCase().replaceAll("[^a-z0-9]", "");
        input = input.replace("one", "1").replace("two", "2").replace("three", "3")
                     .replace("four", "4").replace("five", "5").replace("six", "6")
                     .replace("seven", "7").replace("eight", "8").replace("nine", "9")
                     .replace("zero", "0");
        return input;
    }

    @DeleteMapping("/{id}")
    public void deleteSemester(@PathVariable Long id) {
        semesterService.deleteSemester(id);
    }
}
