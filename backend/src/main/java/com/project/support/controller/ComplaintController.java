package com.project.support.controller;

import com.project.support.entity.Complaint;
import com.project.support.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/complaints")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ComplaintController {

    private final ComplaintService complaintService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody java.util.Map<String, Object> body) {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        String customerName = body.get("customerName").toString();
        String issue = body.get("issue").toString();
        return ResponseEntity.ok(complaintService.createComplaint(new Complaint(orderId, customerName, issue)));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Complaint> resolveComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String solution = body.get("solution");
        return ResponseEntity.ok(complaintService.resolveComplaint(id, solution));
    }
}
