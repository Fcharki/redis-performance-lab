import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RequestPanel from "./RequestPanel";

describe("RequestPanel", () => {
  it("renders results and triggers a new run", async () => {
    const onRun = vi.fn();

    render(
      <RequestPanel
        results={["Request 1: HTTP 200", "Request 11: HTTP 429 - Rate limited"]}
        testing={false}
        onRun={onRun}
      />
    );

    expect(screen.getByText("Request 1: HTTP 200")).toBeInTheDocument();
    expect(
      screen.getByText("Request 11: HTTP 429 - Rate limited")
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: /run rate limit test/i })
    );

    expect(onRun).toHaveBeenCalledOnce();
  });

  it("disables the button while testing", () => {
    render(
      <RequestPanel results={[]} testing onRun={vi.fn()} />
    );

    expect(
      screen.getByRole("button", { name: /testing/i })
    ).toBeDisabled();
  });
});
