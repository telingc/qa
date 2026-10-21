import numpy as np
import matplotlib.pyplot as plt

def saddle(x, y):
    return x**2 - y**2

def non_harmonic_saddle(x, y):
    return x**2 - 2 * y**2

def crown(x, y):
    return np.real((x + 1j * y)**16)

def numerical_laplacian(func, x, y, h):
    """Approximate the 2D Laplacian using central differences."""
    if not np.isfinite(h) or h <= 0:
        raise ValueError("h must be finite and positive.")

    center = func(x, y)
    f_xx = (
        func(x + h, y) - 2 * center + func(x - h, y)
    ) / h**2
    f_yy = (
        func(x, y + h) - 2 * center + func(x, y - h)
    ) / h**2
    return f_xx + f_yy

def examine(func, points, h=1e-3):
    """Compare numerical Laplacians at two step sizes."""
    points = np.asarray(points, dtype=float)
    if points.ndim != 2 or points.shape[1] != 2:
        raise ValueError("points must have shape (n, 2).")

    x, y = points.T
    coarse = numerical_laplacian(func, x, y, h)
    fine = numerical_laplacian(func, x, y, h / 2)

    print(f"\n{func.__name__}")
    print(f"{'Point':>18} {'Laplacian(h)':>18} {'Laplacian(h/2)':>18}")
    for (x_i, y_i), value_h, value_half_h in zip(
        points, coarse, fine
    ):
        print(
            f"({x_i:6.2f}, {y_i:6.2f})"
            f" {value_h:+18.6e} {value_half_h:+18.6e}"
        )

    return coarse, fine

def visualize(functions):
    """Plot each (function, title) pair over the unit disk."""
    if not functions:
        raise ValueError("At least one function is required.")

    r = np.linspace(0, 1, 101)
    theta = np.linspace(0, 2 * np.pi, 513)
    r_grid, theta_grid = np.meshgrid(r, theta)

    x = r_grid * np.cos(theta_grid)
    y = r_grid * np.sin(theta_grid)

    n_rows = len(functions)
    fig = plt.figure(
        figsize=(12, 4.5 * n_rows),
        layout="constrained",
    )

    for row, (func, title) in enumerate(functions):
        values = func(x, y)

        color_limit = float(np.max(np.abs(values)))
        if color_limit == 0:
            color_limit = 1.0

        color_options = {
            "cmap": "coolwarm",
            "vmin": -color_limit,
            "vmax": color_limit,
        }

        ax_3d = fig.add_subplot(
            n_rows, 2, 2 * row + 1, projection="3d"
        )
        surface = ax_3d.plot_surface(
            x, y, values,
            rstride=2,
            cstride=1,
            linewidth=0,
            antialiased=True,
            **color_options,
        )
        ax_3d.set(
            xlabel=r"$x$",
            ylabel=r"$y$",
            zlabel=r"$V$",
            title=title,
            zlim=(-color_limit, color_limit),
        )
        ax_3d.set_box_aspect((1, 1, 0.8))
        ax_3d.view_init(elev=30, azim=-55)

        ax_top = fig.add_subplot(
            n_rows, 2, 2 * row + 2, projection="polar"
        )
        ax_top.grid(False)
        ax_top.pcolormesh(
            theta_grid, r_grid, values,
            shading="gouraud",
            **color_options,
        )
        ax_top.set_ylim(0, 1)
        ax_top.set_rticks([0.5, 1.0])
        ax_top.set_thetagrids(
            [0, 90, 180, 270],
            labels=[r"$0$", r"$\pi/2$", r"$\pi$", r"$3\pi/2$"],
        )
        ax_top.set_title("Top view", pad=20)
        ax_top.grid(alpha=0.2)

        fig.colorbar(
            surface,
            ax=[ax_3d, ax_top],
            shrink=0.75,
            label=r"$V$",
        )

    plt.show()
    return fig