package com.academic.tracker.dto;

import jakarta.validation.constraints.*;

public class ModuleRequest {
    @NotBlank(message = "code is required")
    @Size(max = 64)
    private String code;

    @NotBlank(message = "name is required")
    @Size(max = 255)
    private String name;

    @NotNull
    @Min(value = 1, message = "credits must be at least 1")
    @Max(value = 30, message = "credits seems too large")
    private int credits;


    private Long semesterId;


    @Pattern(regexp = "(^$)|(^[A-D][+-]?$)|(^F$)|(^I$)|(^S$)|(^U$)", message = "invalid grade")
    private String grade;

    // getters and setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCredits() { return credits; }
    public void setCredits(int credits) { this.credits = credits; }

    public Long getSemesterId() { return semesterId; }
    public void setSemesterId(Long semesterId) { this.semesterId = semesterId; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }
}
