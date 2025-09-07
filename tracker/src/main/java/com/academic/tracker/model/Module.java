package com.academic.tracker.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(
    name = "module",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "code"}),
    indexes = {
        @Index(name = "idx_module_user", columnList = "user_id"),
        @Index(name = "idx_module_semester", columnList = "semester_id"),
        @Index(name = "idx_module_semnum", columnList = "module_semester")
    }
)

public class Module {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String code;

    @Column(nullable = false, length = 255)
    private String name;

    // Map to DB column 'module_credits' (aligns with current schema)
    @Column(name = "module_credits", nullable = false)
    private Integer credits;   // use Integer, not primitive

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id")
    @JsonIgnore
    private Semester semester;

    // Legacy denormalized column required by DB schema
    @Column(name = "module_semester", nullable = false)
    private Integer semesterNumber = 0; // default to 0 to satisfy NOT NULL


    public Module() {}
    public Module(Long id) { this.id = id; }

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @JsonProperty("credits")
    public Integer getCredits() { return credits; }

    @JsonProperty("credits")
    public void setCredits(Integer credits) { this.credits = credits; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Semester getSemester() { return semester; }
    public void setSemester(Semester semester) {
        this.semester = semester;
        if (semester != null) {
            this.semesterNumber = semester.getNumber();
        }
    }

    @JsonProperty("semesterId")
    public Long getSemesterId() {
        return semester != null ? semester.getId() : null;
    }

    public Integer getSemesterNumber() { return semesterNumber; }
    public void setSemesterNumber(Integer semesterNumber) { this.semesterNumber = semesterNumber; }

    @PrePersist
    @PreUpdate
    private void ensureConsistency() {
        if (this.credits == null) {
            throw new IllegalStateException("Module.credits must be set before saving");
        }
        if (this.semester == null && this.semesterNumber == null) {
            // keep DB happy when module_semester is NOT NULL
            this.semesterNumber = 0;
        }
    }
}