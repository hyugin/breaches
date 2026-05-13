import React from "react";
import { it, expect, vi, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import BreachList from "./breach-list.component";

const mockData = [
  { Name: "Adobe", Domain: "adobe.com", BreachDate: "2013-10-04" },
  { Name: "LinkedIn", Domain: "linkedin.com", BreachDate: "2012-05-05" },
  { Name: "Dropbox", Domain: "dropbox.com", BreachDate: "2012-07-01" },
];

describe("BreachList", () => {
  it("returns null when show is false", () => {
    const { container } = render(
      <BreachList show={false} loading={false} data={[]} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders loading state with skeletons", () => {
    // Need data to render rows that show skeletons when loading
    render(<BreachList show={true} loading={true} data={mockData} />);

    // When loading, toolbar shows null for rowCount
    expect(screen.getByText(/Breaches/)).toBeInTheDocument();
    // Skeleton elements are present (MUI Skeleton renders as spans with specific classes)
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders breach data correctly", () => {
    render(<BreachList show={true} loading={false} data={mockData} />);

    expect(screen.getByText("3 Breaches")).toBeInTheDocument();
    expect(screen.getByText("Adobe")).toBeInTheDocument();
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("Dropbox")).toBeInTheDocument();
    expect(screen.getByText("adobe.com")).toBeInTheDocument();
    expect(screen.getByText("2013-10-04")).toBeInTheDocument();
  });

  it("shows 'No Breaches Found' when data is empty", () => {
    render(<BreachList show={true} loading={false} data={[]} />);

    expect(screen.getByText("0 Breaches")).toBeInTheDocument();
    expect(screen.getByText("No Breaches Found")).toBeInTheDocument();
  });

  it("handles sorting when clicking header", async () => {
    render(<BreachList show={true} loading={false} data={mockData} />);

    const nameHeader = screen.getByText("Name");
    fireEvent.click(nameHeader);

    // Data should still be visible after sort
    await waitFor(() => {
      expect(screen.getByText("Adobe")).toBeInTheDocument();
    });
  });

  it("handles pagination", () => {
    const lotsOfData = Array.from({ length: 10 }, (_, i) => ({
      Name: `Breach${i}`,
      Domain: `domain${i}.com`,
      BreachDate: "2020-01-01",
    }));

    render(<BreachList show={true} loading={false} data={lotsOfData} />);

    expect(screen.getByText("10 Breaches")).toBeInTheDocument();

    // Pagination controls should be present (MUI TablePagination component)
    const pagination = document.querySelector('.MuiTablePagination-root');
    expect(pagination).toBeInTheDocument();
  });

  it("updates rows when data prop changes", async () => {
    const { rerender } = render(
      <BreachList show={true} loading={false} data={mockData.slice(0, 1)} />
    );

    expect(screen.getByText("1 Breaches")).toBeInTheDocument();
    expect(screen.getByText("Adobe")).toBeInTheDocument();

    rerender(<BreachList show={true} loading={false} data={mockData} />);

    await waitFor(() => {
      expect(screen.getByText("3 Breaches")).toBeInTheDocument();
      expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    });
  });
});
