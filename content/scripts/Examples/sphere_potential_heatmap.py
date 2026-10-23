import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.patches import Circle


POTENTIAL_STYLE = {
    "figsize": (7.5, 6.5),
    "font_size": 11,
    "boundary": "#243b50",
    "cmap": LinearSegmentedColormap.from_list(
        "blue_gold", ["#edf4fa", "#8bb6d0", "#f5dca0", "#bd752b"]
    ),
}


def solid_sphere_potential(r, radius=1.0, charge=1.0, epsilon_0=1.0):
    """Uniform volume charge, vacuum, and V(infinity) = 0."""
    r = np.asarray(r, dtype=float)
    if (not np.isfinite(radius) or radius <= 0
            or not np.isfinite(epsilon_0) or epsilon_0 <= 0
            or not np.isfinite(charge)
            or np.any(~np.isfinite(r)) or np.any(r < 0)):
        raise ValueError("Use R > 0, epsilon_0 > 0, and finite nonnegative r.")
    shape = np.where(
        r <= radius,
        0.5 * (3 - (r / radius)**2),
        radius / np.maximum(r, radius),
    )
    return charge / (4 * np.pi * epsilon_0 * radius) * shape


def visualize_sphere_potential(radius=1.0, charge=1.0, epsilon_0=1.0,
                                extent=3.0, resolution=601, style=None):
    """Draw the z=0 section; extent is the half-width measured in units of R."""
    if not np.isfinite(extent) or extent <= 1:
        raise ValueError("extent must exceed 1 to show the exterior.")
    if not isinstance(resolution, int) or resolution < 3:
        raise ValueError("resolution must be an integer >= 3.")
    theme = {**POTENTIAL_STYLE, **(style or {})}
    coordinates = np.linspace(-extent, extent, resolution)
    x, y = np.meshgrid(coordinates, coordinates)
    r = radius * np.hypot(x, y)
    potential = solid_sphere_potential(r, radius, charge, epsilon_0)
    scale = abs(charge) / (4 * np.pi * epsilon_0 * radius) or 1.0
    values = potential / scale
    vmin, vmax = (-1.5, 1.5) if charge < 0 else (0.0, 1.5)
    cmap = "coolwarm" if charge < 0 else theme["cmap"]

    with plt.rc_context({"font.family": "DejaVu Sans",
                         "font.size": theme["font_size"]}):
        fig, ax = plt.subplots(figsize=theme["figsize"], layout="constrained")
        image = ax.pcolormesh(
            x, y, values, shading="gouraud", cmap=cmap,
            vmin=vmin, vmax=vmax, rasterized=True,
        )
        if charge != 0:
            levels = np.sign(charge) * np.array([0.5, 1.0, 1.25])
            ax.contour(x, y, values, levels=np.sort(levels),
                       colors=theme["boundary"], linewidths=0.55, alpha=0.25)
        ax.add_patch(Circle((0, 0), 1, fill=False,
                            edgecolor=theme["boundary"], linewidth=1.5))
        ax.annotate(
            r"$r=R$", xy=(2**-0.5, 2**-0.5), xytext=(1.25, 1.05),
            color=theme["boundary"],
            arrowprops={"arrowstyle": "-", "color": theme["boundary"], "lw": 0.8},
        )
        ax.set(xlim=(-extent, extent), ylim=(-extent, extent), aspect="equal",
               xlabel=r"$x/R$", ylabel=r"$y/R$",
               title=r"Solid-Sphere Potential  ($z=0$)")
        ax.grid(color=theme["boundary"], linewidth=0.5, alpha=0.13)
        colorbar = fig.colorbar(image, ax=ax, shrink=0.84, pad=0.025)
        colorbar.set_label(r"$V/V_0$" if charge != 0 else "$V$")
        colorbar.set_ticks([-1.5, -1, -0.5, 0, 0.5, 1, 1.5]
                           if charge < 0 else [0, 0.5, 1, 1.5])
    return fig, ax


if __name__ == "__main__":
    fig, ax = visualize_sphere_potential()
    plt.show()
