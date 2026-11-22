<!--
  PROJECTS: this one file feeds both the home page cards ("My Key Projects")
  and the full Projects page.

  ## Project title                    one project; order here = order on the site
  id: short-name                      address of its section: projects.html#short-name
  kicker: ECE 385                     small label above the title (course, team, etc.)
  date: Fall 2025                     when (any text)
  status: In progress                 optional badge
  image: assets/images/file.jpg       1200×750 (16:10), under ~300 KB (.svg works too)
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
image: assets/images/covers/retro-game-suite.svg
alt: Illustration of an FPGA chip wired to a pixel-art two-player game screen
summary: Six two-player arcade games on a MicroBlaze SoC, driven by a custom SystemVerilog game engine with single-frame input latency at 60 Hz.
tags: SystemVerilog, C, Vivado, Vitis, MicroBlaze, FPGA
featured: yes

<!-- Your notes: How is it hardware-accelerated? What is the SoC and how is it used?
     What was necessary when developing programs in SystemVerilog? -->

A six-game, two-player arcade platform built on a MicroBlaze system-on-chip running on an Urbana Board FPGA. The MicroBlaze processor runs the C code that talks to the USB keyboard, while everything that has to keep pace with the display runs in custom hardware.

### How it works

- **Input path.** USB keycodes come in through a MAX3421E USB host peripheral, pass through AXI GPIO, and are packed into a 32-bit hardware input word, so both players' keys are detected in parallel instead of one at a time.
- **Game engine in RTL.** A custom SystemVerilog game engine, color mapper, and text renderer generate every frame in hardware and drive the display through a VGA controller and HDMI pipeline.
- **One-frame latency.** Gated keycodes are sampled on vsync at 60 Hz, so a key press shows up on screen by the next frame.
- **Verification.** Testbenches cover the VGA controller and the HDMI pipeline.


## AuroraOS
id: aurora-os
status: In progress
image: assets/images/covers/aurora-os.svg
alt: Illustration of an operating-system layer stack beside a terminal booting a RISC-V kernel
summary: RISC-V OS development for embedded systems, allowing the loading and execution of user applications.
tags: C, Assembly, RISC-V
featured: yes

An operating system for RISC-V embedded systems, written in C and assembly, with the goal of loading and running user applications. I'm still building it; a full write-up will follow once it's finished.

## SoLoGUI: Sound Localization Data Pipeline & GUI
id: sologui
kicker: Poster presentation
image: assets/images/covers/sologui.svg
alt: Illustration of a polar sound-localization plot beside a waveform and an accuracy-versus-SNR bar chart
summary: Parses raw LabVIEW data and batch-computes latency and accuracy metrics across 16 subjects, with a benchmarking framework and GUI for SNR threshold testing.
tags: MATLAB, LabVIEW, Excel
featured: yes

A MATLAB data pipeline and GUI for a sound-localization study, presented as a research poster.

- **Automated analysis.** The pipeline takes raw LabVIEW recordings and computes response latency and localization accuracy for all 16 subjects in one batch.
- **SNR benchmarking.** A framework sweeps signal-to-noise thresholds to quantify how interference degrades detection accuracy.
- **GUI.** A front end for SNR threshold testing on top of the pipeline.


## Smart City Parking App
id: smart-parking
kicker: APS Data Technologies · Poster presentation
date: 2023 – 2024
image: assets/images/covers/smart-parking.svg
alt: Illustration of a parking lot seen from above, with detection boxes around parked cars and open spots marked
summary: A citywide smart-parking app whose FastSAM computer-vision pipeline detects cars and registers spots, deployed to a 30,000-user pilot in Aurora, IL.
tags: Python, PyTorch, OpenCV, CUDA, Docker, C/C++

A full-stack smart-parking app built during my software engineering internship at APS Data Technologies and presented as a poster.

- **Detection.** Improved the car-detection algorithm and pipeline using the FastSAM computer-vision model, making parking-spot registration and user billing more efficient for a citywide rollout.
- **Accuracy.** My preprocessing and model-inference code in the OpenCV and PyTorch pipeline improved detection accuracy by 25%.
- **Deployment.** The app went to a 30,000-user pilot in Aurora, IL, handling spot registration and billing.

