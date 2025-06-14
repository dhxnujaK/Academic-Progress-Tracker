package com.academic.tracker.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @NotBlank(message = "Module code is required")
    @JsonProperty("ModuleCode")
    private String moduleCode;

    @NotBlank(message = "Module name is required")
    @JsonProperty("ModuleName")
    private String moduleName;

    @Min(value = 1, message = "Module credits must be at least 1")
    @JsonProperty("ModuleCredits")
    private int moduleCredits;

    @NotBlank(message = "Module grade is required")
    @JsonProperty("ModuleGrade")
    private String moduleGrade;

    @Min(value = 1, message = "Module semester must be at least 1")
    private int moduleSemester;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Default constructor (required by JPA)
    public Module() {}

    // Custom constructor (optional)
    public Module(String moduleCode, String moduleName, int moduleCredits, String moduleGrade, int moduleSemester) {
        this.moduleCode = moduleCode;
        this.moduleName = moduleName;
        this.moduleCredits = moduleCredits;
        this.moduleGrade = moduleGrade;
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

    @JsonProperty("ModuleCode")
    public String getModuleCode() { return moduleCode; }
    public void setModuleCode(String moduleCode) { this.moduleCode = moduleCode; }

    @JsonProperty("ModuleName")
    public String getModuleName() { return moduleName; }
    public void setModuleName(String moduleName) { this.moduleName = moduleName; }

    @JsonProperty("ModuleCredits")
    public int getModuleCredits() { return moduleCredits; }
    public void setModuleCredits(int moduleCredits) { this.moduleCredits = moduleCredits; }

    @JsonProperty("ModuleGrade")
    public String getModuleGrade() { return moduleGrade; }
    public void setModuleGrade(String moduleGrade) { this.moduleGrade = moduleGrade; }

    public int getModuleSemester() { return moduleSemester; }
    public void setModuleSemester(int moduleSemester) { this.moduleSemester = moduleSemester; }
}