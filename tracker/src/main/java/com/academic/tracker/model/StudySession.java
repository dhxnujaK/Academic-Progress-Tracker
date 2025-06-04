package com.academic.tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionType;

    private int durationInMinutes;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    // Optional: associate with a module if needed
    @ManyToOne
    @JoinColumn(name = "module_id")
    private Module module;

    // Constructors
    public StudySession() {}

    public StudySession(String sessionType, int durationInMinutes, LocalDateTime startTime, LocalDateTime endTime, Module module) {
        this.sessionType = sessionType;
        this.durationInMinutes = durationInMinutes;
        this.startTime = startTime;
        this.endTime = endTime;
        this.module = module;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionType() { return sessionType; }
    public void setSessionType(String sessionType) { this.sessionType = sessionType; }

    public int getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(int durationInMinutes) { this.durationInMinutes = durationInMinutes; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Module getModule() { return module; }
    public void setModule(Module module) { this.module = module; }
}