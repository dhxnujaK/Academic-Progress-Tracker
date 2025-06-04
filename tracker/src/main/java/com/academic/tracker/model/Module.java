package com.academic.tracker.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @NotBlank(message = "Module code is required")
    private String ModuleCode;

    @NotBlank(message = "Module name is required")
    private String ModuleName;

    @Min(value = 1, message = "Module credits must be at least 1")
    private int ModuleCredits;

    @NotBlank(message = "Module grade is required")
    private String ModuleGrade;

    @Min(value = 1, message = "Module semester must be at least 1")
    private int moduleSemester;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor (required by JPA)
    public Module() {}

    // Custom constructor (optional)
    public Module(String moduleCode, String moduleName, int moduleCredits, String moduleGrade, int moduleSemester) {
        this.ModuleCode = moduleCode;
        this.ModuleName = moduleName;
        this.ModuleCredits = moduleCredits;
        this.ModuleGrade = moduleGrade;
        this.moduleSemester = moduleSemester;
    }

    // Getters and Setters
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getModuleCode() { return ModuleCode; }
    public void setModuleCode(String moduleCode) { this.ModuleCode = moduleCode; }

    public String getModuleName() { return ModuleName; }
    public void setModuleName(String moduleName) { this.ModuleName = moduleName; }

    public int getModuleCredits() { return ModuleCredits; }
    public void setModuleCredits(int moduleCredits) { this.ModuleCredits = moduleCredits; }

    public String getModuleGrade() { return ModuleGrade; }
    public void setModuleGrade(String moduleGrade) { this.ModuleGrade = moduleGrade; }

    public int getModuleSemester() { return moduleSemester; }
    public void setModuleSemester(int moduleSemester) { this.moduleSemester = moduleSemester; }
}