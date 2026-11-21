<!--
  PROJECTS: this one file feeds both the home page cards ("My Key Projects")
  and the full Projects page.

  ## Project title                    one project; order here = order on the site
  id: short-name                      address of its section: projects.html#short-name
  kicker: ECE 385                     small label above the title (course, team, etc.)
  date: Fall 2025                     when (any text)
  status: In progress                 optional badge
  image: assets/images/file.jpg       1200×750 (16:10), under ~300 KB
  alt: What the image shows           for screen readers
  summary: One or two sentences.      shown on the cards and at the top of its section
  tags: SystemVerilog, FPGA           chips
  links: [Code](https://github.com/...), [Demo](https://...)
  featured: yes                       also show it on the home page (first one gets the big card)

  Then a blank line and the full write-up in Markdown (only on the Projects page).
  Comments like this one never appear on the site.
-->

## Two-Player Retro Game Suite: Hardware-Accelerated SoC FPGA
id: retro-game-suite
kicker: ECE 385
image: assets/images/project-1.jpg
alt: [Describe what the image shows]
summary: Six two-player arcade games on a MicroBlaze SoC, driven by a custom SystemVerilog game engine with single-frame input latency at 60 Hz.
tags: SystemVerilog, C, FPGA, MicroBlaze
featured: yes

<!-- Your notes: How is it hardware-accelerated? What is the SoC and how is it used?
     What was necessary when developing programs in SystemVerilog? -->

[Full write-up: the problem, what you built, how it works, and what you'd do differently.]

## AuroraOS
id: aurora-os
status: In progress
image: assets/images/project-2.jpg
alt: [Describe what the image shows]
summary: RISC-V OS development for embedded systems, allowing the loading and execution of user applications.
tags: C, Assembly, RISC-V
featured: yes

[Full write-up.]

## SoLoGUI
id: sologui
image: assets/images/project-3.jpg
alt: [Describe what the image shows]
summary: Parses raw LabVIEW data and batch-computes latency and accuracy metrics across 16 subjects, with a benchmarking framework and GUI for SNR threshold testing.
tags: MATLAB
featured: yes

[Full write-up.]
