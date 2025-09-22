package com.academic.tracker.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class UserProfileUpdateRequest {
    @NotBlank
    private String name;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String username;

    private String university;
    private String degree;
    private Integer academicYear;
    private Integer graduationYear;
    private String batch;
    private String universityRegNumber;
    private String alYear;

    private String telephone;
    private LocalDate dob;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getUniversityRegNumber() { return universityRegNumber; }
    public void setUniversityRegNumber(String universityRegNumber) { this.universityRegNumber = universityRegNumber; }
    public String getAlYear() { return alYear; }
    public void setAlYear(String alYear) { this.alYear = alYear; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
}

