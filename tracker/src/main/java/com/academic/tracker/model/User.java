package com.academic.tracker.model;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Module> modules;

    private String name;
    private String university;
    private int academicYear;
    private String degree;
    private int graduationYear;

    private String profilePictureUrl;

    private java.time.LocalDateTime lastLogin;

    private boolean isActive;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String batch;

    @Column(nullable = false, unique = true)
    private String universityRegNumber;

    @Column(nullable = false)
    private String alYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    public enum Role {
        STUDENT,
        ADMIN
    }

    public User() {}

    public User(String username, String email) {
        this.username = username;
        this.email = email;
    }

    public User(String username, String email, String name, String university, int academicYear, String degree, int graduationYear) {
        this.username = username;
        this.email = email;
        this.name = name;
        this.university = university;
        this.academicYear = academicYear;
        this.degree = degree;
        this.graduationYear = graduationYear;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public List<Module> getModules() { return modules; }
    public void setModules(List<Module> modules) { this.modules = modules; }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public int getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(int academicYear) {
        this.academicYear = academicYear;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public int getGraduationYear() {
        return graduationYear;
    }

    public void setGraduationYear(int graduationYear) {
        this.graduationYear = graduationYear;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public java.time.LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(java.time.LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }

    public String getUniversityRegNumber() { return universityRegNumber; }
    public void setUniversityRegNumber(String universityRegNumber) { this.universityRegNumber = universityRegNumber; }

    public String getAlYear() { return alYear; }
    public void setAlYear(String alYear) { this.alYear = alYear; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}