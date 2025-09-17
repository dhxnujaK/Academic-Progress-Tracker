package com.academic.tracker.service;

import com.academic.tracker.model.Module;
import com.academic.tracker.model.Semester;
import com.academic.tracker.repository.ModuleRepository;
import com.academic.tracker.repository.SemesterRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class GpaService {

    private final ModuleRepository moduleRepo;
    private final SemesterRepository semesterRepo;

    public GpaService(ModuleRepository moduleRepo, SemesterRepository semesterRepo) {
        this.moduleRepo = moduleRepo;
        this.semesterRepo = semesterRepo;
    }

    // Map grades to grade point values (GPV). Unknown grades are excluded (null).
    private static final Map<String, Double> GPV;
    static {
        Map<String, Double> m = new HashMap<>();
        m.put("A+", 4.0); m.put("A", 4.0); m.put("A-", 3.7);
        m.put("B+", 3.3); m.put("B", 3.0); m.put("B-", 2.7);
        m.put("C+", 2.3); m.put("C", 2.0); m.put("C-", 1.7);
        m.put("D+", 1.3); m.put("D", 1.0);
        m.put("E", 0.0); m.put("F", 0.0);
        // Grades like S/U/I/H/M are not counted toward GPA
        GPV = Collections.unmodifiableMap(m);
    }

    private static Double gpvOf(String grade) {
        if (grade == null) return null;
        return GPV.get(grade.trim().toUpperCase());
    }

    private static double weightForSemesterNumber(Integer semNumber) {
        if (semNumber == null) return 0.0;
        return (semNumber == 1 || semNumber == 2) ? 0.05 : 0.15;
    }

    @Transactional(readOnly = true)
    public Overview overview(Long userId) {
        List<Module> modules = moduleRepo.findByUser_Id(userId);
        List<Semester> semesters = semesterRepo.findByUserIdOrderByNumberAsc(userId);

        // SGPA per semester
        Map<Long, List<Module>> bySemester = new HashMap<>();
        for (Module m : modules) {
            Semester s = m.getSemester();
            if (s != null) bySemester.computeIfAbsent(s.getId(), k -> new ArrayList<>()).add(m);
        }

        List<SemesterGpa> sgpas = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (Semester s : semesters) {
            List<Module> list = bySemester.getOrDefault(s.getId(), Collections.emptyList());
            double num = 0.0, den = 0.0;
            for (Module m : list) {
                Double gpv = gpvOf(m.getGrade());
                Integer credits = m.getCredits();
                if (gpv == null || credits == null || credits <= 0) continue;
                num += credits * gpv;
                den += credits;
            }
            Double sgpa = den > 0 ? (num / den) : null;
            boolean finished = s.getEndDate() != null && s.getEndDate().isBefore(today);
            sgpas.add(new SemesterGpa(s.getId(), s.getNumber(), s.getName(), sgpa, finished));
        }

        // CGPA (weighted as specified)
        double cNum = 0.0, cDen = 0.0;
        for (Module m : modules) {
            Double gpv = gpvOf(m.getGrade());
            Integer credits = m.getCredits();
            Integer semNo = m.getSemesterNumber();
            if (gpv == null || credits == null || credits <= 0 || semNo == null) continue;
            double w = weightForSemesterNumber(semNo);
            cNum += w * credits * gpv;
            cDen += w * credits;
        }
        Double cgpa = cDen > 0 ? (cNum / cDen) : null;

        return new Overview(cgpa, sgpas);
    }

    // DTOs
    public static class SemesterGpa {
        private Long semesterId; private Integer number; private String name; private Double sgpa; private boolean finished;
        public SemesterGpa(Long id, Integer n, String name, Double sgpa, boolean finished) { this.semesterId=id; this.number=n; this.name=name; this.sgpa=sgpa; this.finished=finished; }
        public Long getSemesterId() { return semesterId; }
        public Integer getNumber() { return number; }
        public String getName() { return name; }
        public Double getSgpa() { return sgpa; }
        public boolean isFinished() { return finished; }
    }

    public static class Overview {
        private Double cgpa; private List<SemesterGpa> semesters;
        public Overview(Double cgpa, List<SemesterGpa> semesters) { this.cgpa=cgpa; this.semesters=semesters; }
        public Double getCgpa() { return cgpa; }
        public List<SemesterGpa> getSemesters() { return semesters; }
    }
}

