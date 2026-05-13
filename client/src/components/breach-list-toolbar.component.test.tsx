import React from "react";
import { it, expect, vi, describe } from 'vitest';
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import BreachListToolbar from "./breach-list-toolbar.component";
import { Column } from "../types";

const columns: Column[] = [
  { id: "Name", label: "Name" },
  { id: "Domain", label: "Domain" },
  { id: "BreachDate", label: "Date of Breach" },
];

describe("BreachListToolbar", () => {
  it("renders breach count when not searching", () => {
    render(
      <BreachListToolbar
        columns={columns}
        rowCount={5}
        onSearchChange={vi.fn()}
      />
    );

    expect(screen.getByText("5 Breaches")).toBeInTheDocument();
  });

  it("shows null count when rowCount is null", () => {
    render(
      <BreachListToolbar
        columns={columns}
        rowCount={null}
        onSearchChange={vi.fn()}
      />
    );

    expect(screen.getByText(/Breaches/)).toBeInTheDocument();
  });

  it("opens search interface when search icon is clicked", () => {
    render(
      <BreachListToolbar
        columns={columns}
        rowCount={5}
        onSearchChange={vi.fn()}
      />
    );

    const searchButton = screen.getByLabelText("Search breaches");
    fireEvent.click(searchButton);

    // Search field should appear
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Column")).toBeInTheDocument();
  });

  it("calls onSearchChange when typing in search field", () => {
    const onSearchChange = vi.fn();
    render(
      <BreachListToolbar
        columns={columns}
        rowCount={5}
        onSearchChange={onSearchChange}
      />
    );

    // Open search
    const searchButton = screen.getByLabelText("Search breaches");
    fireEvent.click(searchButton);

    // Type in search field
    const searchField = screen.getByLabelText("Search");
    fireEvent.change(searchField, { target: { value: "adobe" } });

    expect(onSearchChange).toHaveBeenCalledWith("Name", "adobe");
  });

  it("calls onSearchChange with empty string when closing search", () => {
    const onSearchChange = vi.fn();
    render(
      <BreachListToolbar
        columns={columns}
        rowCount={5}
        onSearchChange={onSearchChange}
      />
    );

    // Open search
    const searchButton = screen.getByLabelText("Search breaches");
    fireEvent.click(searchButton);

    // Clear search
    const clearButton = screen.getByLabelText("Clear search");
    fireEvent.click(clearButton);

    expect(onSearchChange).toHaveBeenCalledWith("Name", "");
  });

  it("changes selected column in dropdown", () => {
    const onSearchChange = vi.fn();
    render(
      <BreachListToolbar
        columns={columns}
        rowCount={5}
        onSearchChange={onSearchChange}
      />
    );

    // Open search
    const searchButton = screen.getByLabelText("Search breaches");
    fireEvent.click(searchButton);

    // Open column dropdown and select Domain
    const columnSelect = screen.getByLabelText("Column");
    fireEvent.mouseDown(columnSelect);

    const domainOption = screen.getByText("Domain");
    fireEvent.click(domainOption);

    // Now search should use Domain column
    const searchField = screen.getByLabelText("Search");
    fireEvent.change(searchField, { target: { value: "test" } });

    expect(onSearchChange).toHaveBeenCalledWith("Domain", "test");
  });
});
