package com.esko.eskos2.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.TreeMap;

@RestController
@RequestMapping("/api/v1")
public class ApiController {

    @GetMapping("/get-message")
    public ResponseEntity<Map<String,String>> sayHello(){
        Map<String,String> response = new TreeMap<>();
        response.put("code","ok");
        response.put("message","Hi from Backend!");
        return ResponseEntity.ok(response);
    }

}
