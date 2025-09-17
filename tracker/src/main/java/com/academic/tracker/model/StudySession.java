package com.academic.tracker.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.Duration;

@Entity
@Table(name = "study_session",
        indexes = {
                @Index(name = "idx_ss_user", columnList = "user_id"),
                @Index(name = "idx_ss_module", columnList = "module_id"),
                @Index(name = "idx_ss_start", columnList = "start_time")
        })
public class StudySession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private Module module;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // Some existing databases have this NOT NULL column – map and populate it
    @Column(name = "duration_in_minutes", nullable = false)
    private Integer durationInMinutes = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Module getModule() { return module; }
    public void setModule(Module module) { this.module = module; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationInMinutes() { return durationInMinutes; }
    public void setDurationInMinutes(Integer durationInMinutes) { this.durationInMinutes = durationInMinutes; }

    @PrePersist
    @PreUpdate
    private void computeDuration() {
        if (startTime == null || endTime == null) return;
        long minutes = Math.max(0, Duration.between(startTime, endTime).toMinutes());
        this.durationInMinutes = (int) minutes;
    }
}
