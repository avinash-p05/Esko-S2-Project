package com.esko.eskos2.controller;

// ViewController.java
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String home() {
        // The paths are directly embedded in the JSP now
        return "home";
    }

    @GetMapping("/template")
    public String template() {
        return "template";
    }
}
