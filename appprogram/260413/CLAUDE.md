# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project is in early initialization. The only configuration present is a `.env` file containing an `OPENROUTER_API_KEY`, indicating this will use the OpenRouter API (an LLM routing service that proxies requests to various AI models).

## Environment

- `.env` — contains `OPENROUTER_API_KEY` for OpenRouter API access. Load this via a dotenv library; never hardcode or log the key.

## Context

This directory follows a dated naming convention (`project_b/260413` = April 13, 2026), suggesting it is one of a series of weekly project sessions. A sibling directory (`260406`) contains a web-based quiz application built with HTML, CSS, and JavaScript — that may inform the direction of this project.
