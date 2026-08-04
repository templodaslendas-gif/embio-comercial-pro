import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AdminRoute } from "./AdminRoute";

const mockUseAuth = vi.fn();
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderAtAdmin() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Admin Content</div>
            </AdminRoute>
          }
        />
        <Route path="/auth" element={<div>Auth Page</div>} />
        <Route path="/" element={<div>Normal Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AdminRoute", () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it("shows a loading state while auth is resolving", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true, role: null, roleLoading: true });
    const { container } = renderAtAdmin();
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("redirects unauthenticated users to /auth", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false, role: null, roleLoading: false });
    renderAtAdmin();
    expect(screen.getByText("Auth Page")).toBeInTheDocument();
  });

  it("redirects vendedor users to the normal dashboard", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1" }, loading: false, role: "vendedor", roleLoading: false,
    });
    renderAtAdmin();
    expect(screen.getByText("Normal Dashboard")).toBeInTheDocument();
  });

  it("renders admin content for super_admin users", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "u1" }, loading: false, role: "super_admin", roleLoading: false,
    });
    renderAtAdmin();
    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
