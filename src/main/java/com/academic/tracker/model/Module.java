package com.academic.tracker.model;

import jakarta.persistence.*;

@Entity
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String ModuleCode;
    private String ModuleName;
    private int ModuleCredits;
    private String ModuleGrade;
    private int ModuleSemester;

    // Default constructor (required by JPA)
    public Module() {}

    // Custom constructor (optional)
    public Module(String moduleCode, String moduleName, int moduleCredits, String moduleGrade, int moduleSemester) {
        this.ModuleCode = moduleCode;
        this.ModuleName = moduleName;
        this.ModuleCredits = moduleCredits;
        this.ModuleGrade = moduleGrade;
        this.ModuleSemester = moduleSemester;
    }

    // Getters and Setters
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

    public int getModuleSemester() { return ModuleSemester; }
    public void setModuleSemester(int moduleSemester) { this.ModuleSemester = moduleSemester; }
}