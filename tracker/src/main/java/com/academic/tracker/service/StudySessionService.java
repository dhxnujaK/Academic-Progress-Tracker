package com.academic.tracker.service;

import com.academic.tracker.model.Module;
import com.academic.tracker.model.StudySession;
import com.academic.tracker.model.User;
import com.academic.tracker.repository.ModuleRepository;
import com.academic.tracker.repository.StudySessionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class StudySessionService {

    private final StudySessionRepository sessions;
    private final ModuleRepository modules;

    public StudySessionService(StudySessionRepository sessions, ModuleRepository modules) {
        this.sessions = sessions;
        this.modules = modules;
    }

    @Transactional
    public StudySession recordSession(Long userId, Long moduleId, LocalDateTime start, LocalDateTime end) {
        if (moduleId == null || start == null || end == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "moduleId, startTime, endTime are required");
        }
        if (end.isBefore(start) || end.isEqual(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }
        Module module = modules.findByIdAndUser_Id(moduleId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Module not found for current user"));

        StudySession s = new StudySession();
        s.setUser(new User(userId));
        s.setModule(module);
        s.setStartTime(start);
        s.setEndTime(end);
        return sessions.save(s);
    }

    @Transactional(readOnly = true)
    public TodaySummary todaySummary(Long userId, Long moduleId) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay().minusNanos(1);

        long allSec = sessions.sumAllByUserAndDaySeconds(userId, start, end);
        long moduleSec = 0;
        if (moduleId != null) {
            moduleSec = sessions.sumByUserModuleAndDaySeconds(userId, moduleId, start, end);
        }
        return new TodaySummary(moduleSec, allSec);
    }

    @Transactional(readOnly = true)
    public DayBreakdown breakdownForDate(Long userId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay().minusNanos(1);
        long allSec = sessions.sumAllByUserAndDaySeconds(userId, start, end);
        java.util.List<Object[]> rows = sessions.totalsByUserAndDay(userId, start, end);
        java.util.List<ModuleTotal> totals = new java.util.ArrayList<>();
        for (Object[] r : rows) {
            Long moduleId = ((Number) r[0]).longValue();
            String code = (String) r[1];
            String name = (String) r[2];
            long seconds = ((Number) r[3]).longValue();
            totals.add(new ModuleTotal(moduleId, code, name, seconds));
        }
        return new DayBreakdown(date.toString(), allSec, totals);
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Long> heatmapTotals(Long userId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay().minusNanos(1);
        java.util.List<Object[]> rows = sessions.dailyTotalsInRange(userId, start, end);
        java.util.Map<String, Long> map = new java.util.HashMap<>();
        for (Object[] r : rows) {
            java.sql.Date d = (java.sql.Date) r[0];
            long seconds = ((Number) r[1]).longValue();
            map.put(d.toLocalDate().toString(), seconds);
        }
        return map;
    }

    public static class TodaySummary {
        private long moduleSeconds;
        private long allSeconds;

        public TodaySummary(long moduleSeconds, long allSeconds) {
            this.moduleSeconds = moduleSeconds;
            this.allSeconds = allSeconds;
        }
        public long getModuleSeconds() { return moduleSeconds; }
        public void setModuleSeconds(long v) { this.moduleSeconds = v; }
        public long getAllSeconds() { return allSeconds; }
        public void setAllSeconds(long v) { this.allSeconds = v; }
    }

    public static class ModuleTotal {
        private Long moduleId;
        private String code;
        private String name;
        private long seconds;

        public ModuleTotal(Long moduleId, String code, String name, long seconds) {
            this.moduleId = moduleId; this.code = code; this.name = name; this.seconds = seconds;
        }
        public Long getModuleId() { return moduleId; }
        public void setModuleId(Long moduleId) { this.moduleId = moduleId; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public long getSeconds() { return seconds; }
        public void setSeconds(long seconds) { this.seconds = seconds; }
    }

    public static class DayBreakdown {
        private String date;
        private long allSeconds;
        private java.util.List<ModuleTotal> totals;

        public DayBreakdown(String date, long allSeconds, java.util.List<ModuleTotal> totals) {
            this.date = date; this.allSeconds = allSeconds; this.totals = totals;
        }
        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public long getAllSeconds() { return allSeconds; }
        public void setAllSeconds(long allSeconds) { this.allSeconds = allSeconds; }
        public java.util.List<ModuleTotal> getTotals() { return totals; }
        public void setTotals(java.util.List<ModuleTotal> totals) { this.totals = totals; }
    }
}
