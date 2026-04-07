import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../features/clients/components/commerceProfile/Pagination";

describe("Pagination", () => {
  it("permite uso controlado con currentPage y onPageChange", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    const { rerender } = render(
      <Pagination totalPages={5} currentPage={3} onPageChange={onPageChange} />
    );

    await user.click(screen.getByRole("button", { name: "4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);

    rerender(
      <Pagination totalPages={5} currentPage={1} onPageChange={onPageChange} />
    );

    expect(screen.getByRole("button", { name: /← previous/i })).toBeDisabled();
  });
});
