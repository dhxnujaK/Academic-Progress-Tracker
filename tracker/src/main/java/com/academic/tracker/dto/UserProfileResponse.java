package com.academic.tracker.dto;

import java.time.LocalDate;

public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String name;
    private String university;
    private Integer academicYear;
    private String degree;
    private Integer graduationYear;
    private String profilePictureUrl;
    private String telephone;
    private LocalDate dob;
    private String batch;
    private String universityRegNumber;
    private String alYear;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getUniversity() { return university; }
    public void setUniversity(String university) { this.university = university; }
    public Integer getAcademicYear() { return academicYear; }
    public void setAcademicYear(Integer academicYear) { this.academicYear = academicYear; }
    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
    public Integer getGraduationYear() { return graduationYear; }
    public void setGraduationYear(Integer graduationYear) { this.graduationYear = graduationYear; }
    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getUniversityRegNumber() { return universityRegNumber; }
    public void setUniversityRegNumber(String universityRegNumber) { this.universityRegNumber = universityRegNumber; }
    public String getAlYear() { return alYear; }
    public void setAlYear(String alYear) { this.alYear = alYear; }
}

