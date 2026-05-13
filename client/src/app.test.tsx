import React from "react";
import { it, expect, vi, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { SnackbarProvider } from "notistack";
import App from "./app";
import { GET_BREACHES } from "./app";

// Mock the GraphQL query - we need to export GET_BREACHES or create a mock
const mocks = [
  {
    request: {
      query: GET_BREACHES,
      variables: { email: "test@example.com" },
    },
    result: {
      data: {
        breaches: [
          { Name: "Adobe", Domain: "adobe.com", BreachDate: "2013-10-04" },
        ],
      },
    },
  },
];

const errorMock = [
  {
    request: {
      query: GET_BREACHES,
      variables: { email: "error@example.com" },
    },
    error: new Error("Network error"),
  },
];

const emptyMock = [
  {
    request: {
      query: GET_BREACHES,
      variables: { email: "empty@example.com" },
    },
    result: {
      data: {
        breaches: [],
      },
    },
  },
];

describe("App", () => {
  it("renders the form initially", () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </MockedProvider>
    );

    expect(screen.getByText("Email Breach Checker")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByText("Breached?")).toBeInTheDocument();
  });

  it("submits form and displays breach results", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </MockedProvider>
    );

    const emailInput = screen.getByLabelText("Email address");
    const submitButton = screen.getByText("Breached?");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("1 Breaches")).toBeInTheDocument();
      expect(screen.getByText("Adobe")).toBeInTheDocument();
    });
  });

  it("displays 'No Breaches Found' when no breaches", async () => {
    render(
      <MockedProvider mocks={emptyMock} addTypename={false}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </MockedProvider>
    );

    const emailInput = screen.getByLabelText("Email address");
    const submitButton = screen.getByText("Breached?");

    fireEvent.change(emailInput, { target: { value: "empty@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("0 Breaches")).toBeInTheDocument();
      expect(screen.getByText("No Breaches Found")).toBeInTheDocument();
    });
  });

  it("shows error snackbar on query failure", async () => {
    render(
      <MockedProvider mocks={errorMock} addTypename={false}>
        <SnackbarProvider maxSnack={3}>
          <App />
        </SnackbarProvider>
      </MockedProvider>
    );

    const emailInput = screen.getByLabelText("Email address");
    const submitButton = screen.getByText("Breached?");

    fireEvent.change(emailInput, { target: { value: "error@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });
});
