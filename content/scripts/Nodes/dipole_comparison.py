"""Physical and ideal 3-D electric dipoles shown on the y=0 section.

Coordinates are in units of a fixed length L, chosen as the physical charge
separation. Both dipoles have p along +z and the same magnitude p=qL.
Potentials are normalized by V0=p/(4*pi*epsilon_0*L**2), and electric fields
by E0=V0/L. White streamlines follow the actual three-dimensional fields in
this invariant plane; streamline density does not encode field magnitude.
Dependencies: NumPy, Matplotlib, and the existing heatmap.py.
"""

from pathlib import Path
from runpy import run_path

import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import numpy as np


def physical_potential(x, z):
    """V/V0 for +q at z/L=1/2 and -q at z/L=-1/2."""
    return 1 / np.hypot(x, z - 0.5) - 1 / np.hypot(x, z + 0.5)


def ideal_potential(x, z):
    """V/V0 for an ideal point dipole p along +z, located at the origin."""
    radius = np.hypot(x, z)
    return z / radius**3


def physical_field(x, z):
    """Return (Ex/E0, Ez/E0) for the physical dipole."""
    x, z = np.asarray(x), np.asarray(z)
    positive_distance = np.hypot(x, z - 0.5)
    negative_distance = np.hypot(x, z + 0.5)
    ex = x / positive_distance**3 - x / negative_distance**3
    ez = ((z - 0.5) / positive_distance**3
          - (z + 0.5) / negative_distance**3)
    return ex, ez


def ideal_field(x, z):
    """Return (Ex/E0, Ez/E0) for the ideal point dipole."""
    x, z = np.asarray(x), np.asarray(z)
    radius = np.hypot(x, z)
    return 3 * x * z / radius**5, (3 * z**2 - radius**2) / radius**5


def _load_heatmap():
    return run_path(str(Path(__file__).resolve().with_name("heatmap.py")))[
        "plot_heatmap"
    ]


def visualize_dipoles(extent=2.5, resolution=501, color_limit=5.0):
    """Return (fig, axes) with matched potential colors and white field lines.

    No region of the heatmap is covered. Only undefined potential samples are
    automatically masked by heatmap.py. Streamline integration stops in tiny
    neighborhoods of the singularities, beneath the source symbols.
    color_limit changes only color saturation, not computed potentials.
    """
    if (not np.all(np.isfinite([extent, color_limit]))
            or extent <= 0.75 or color_limit <= 0):
        raise ValueError("Use finite extent > 0.75 and color_limit > 0.")
    if (isinstance(resolution, bool)
            or not isinstance(resolution, (int, np.integer))
            or resolution < 51):
        raise ValueError("resolution must be an integer >= 51.")
    plot_heatmap = _load_heatmap()
    colors = LinearSegmentedColormap.from_list(
        "dipole_potential", ["#276faa", "#172b40", "#cf5550"], N=256,
    )
    ink = "#263e53"
    gold = "#f1c777"
    coordinates = np.linspace(-extent, extent, resolution)
    x, z = np.meshgrid(coordinates, coordinates)

    with plt.rc_context({"font.family": "DejaVu Sans", "font.size": 11,
                         "text.color": ink, "axes.labelcolor": ink,
                         "svg.fonttype": "none"}):
        fig, axes = plt.subplots(1, 2, figsize=(12.6, 8.0))
        fig.subplots_adjust(left=0.06, right=0.975, bottom=0.36,
                            top=0.83, wspace=0.19)
        fig.suptitle("Physical and Ideal Electric Dipoles", y=0.98,
                     fontsize=19, fontweight="bold")
        fig.text(0.5, 0.92,
                 r"Same $\mathbf{p}=p\,\hat{\mathbf{z}}$"
                 r"    |    $y=0$ section    |    $V(\infty)=0$",
                 ha="center", fontsize=12)
        models = [
            (physical_potential, physical_field, "Physical dipole"),
            (ideal_potential, ideal_field, "Ideal point dipole"),
        ]
        meshes = []
        for index, (ax, (potential, field, title)) in enumerate(zip(axes, models)):
            _, _, mesh = plot_heatmap(
                potential, (-extent, extent), (-extent, extent), ax=ax,
                resolution=resolution, cmap=colors, scale="symlog",
                linthresh=0.04, vlim=(-color_limit, color_limit),
                title=title, xlabel=r"$x/L$", ylabel=r"$z/L$",
            )
            mesh.colorbar.remove()
            meshes.append(mesh)
            ax.grid(False)
            ax.set_title(title, fontsize=14, pad=12)
            with np.errstate(divide="ignore", invalid="ignore"):
                ex, ez = field(x, z)
                magnitude = np.hypot(ex, ez)
                direction_x, direction_z = ex / magnitude, ez / magnitude
            if index == 0:
                stop = ((np.hypot(x, z - 0.5) < 0.05)
                        | (np.hypot(x, z + 0.5) < 0.05))
            else:
                stop = np.hypot(x, z) < 0.05
            stop |= ~np.isfinite(direction_x) | ~np.isfinite(direction_z)
            # Matched seed locations give readable, continuous curves rather
            # than numerous short pieces from automatic grid seeding.
            equator_x = extent * np.array(
                [-0.92, -0.66, -0.46, -0.30, -0.18, -0.10,
                 0.10, 0.18, 0.30, 0.46, 0.66, 0.92]
            )
            upper_x = extent * np.array([-0.9, -0.55, -0.22, 0.22, 0.55, 0.9])
            seeds = np.vstack((
                np.column_stack((equator_x, np.zeros_like(equator_x))),
                np.column_stack((upper_x, np.full_like(upper_x, 0.96 * extent))),
                [[0, 0.75 * extent], [0, -0.75 * extent]],
            ))
            ax.streamplot(
                coordinates, coordinates,
                np.ma.array(direction_x, mask=stop),
                np.ma.array(direction_z, mask=stop),
                color="white", density=1.4, linewidth=0.9,
                arrowsize=1.15, arrowstyle="-|>", minlength=0.12,
                start_points=seeds, integration_direction="both",
                broken_streamlines=False, maxlength=12,
                zorder=3,
            )

            if index == 0:
                for source_z, label, symbol, color in (
                    (0.5, r"$+q$", "+", "#d66b62"),
                    (-0.5, r"$-q$", "−", "#397eaf"),
                ):
                    ax.scatter(0, source_z, s=170, color=color,
                               edgecolors="white", linewidths=1.3, zorder=6)
                    ax.text(0, source_z, symbol, color="white", fontsize=15,
                            ha="center", va="center", zorder=7)
                    ax.annotate(label, (0, source_z), xytext=(15, 3),
                                textcoords="offset points", color="white",
                                fontsize=12, zorder=7)
                ax.annotate("", xy=(-0.31, 0.5), xytext=(-0.31, -0.5),
                            arrowprops={"arrowstyle": "<->", "color": gold,
                                        "lw": 1.3}, zorder=6)
                ax.text(-0.48, 0, r"$d$", color=gold, fontsize=13,
                        ha="center", va="center", zorder=7)
                caption = r"Finite charges; separation $d=L$"
            else:
                ax.scatter(0, 0, s=46, color=gold,
                           edgecolors="white", linewidths=0.8, zorder=6)
                ax.annotate("", xy=(0, 0.37), xytext=(0, 0),
                            arrowprops={"arrowstyle": "-|>", "color": gold,
                                        "lw": 2.2}, zorder=7)
                ax.text(0.16, 0.19, r"$\mathbf{p}$", color=gold,
                        fontsize=16, zorder=7)
                caption = r"$d\to0$, $q\to\infty$, with $qd=p$ fixed"
            position = ax.get_position()
            fig.text(position.x0 + position.width / 2, 0.255, caption,
                     ha="center", fontsize=11)

        colorbar_ax = fig.add_axes((0.3, 0.145, 0.4, 0.025))
        colorbar = fig.colorbar(meshes[-1], cax=colorbar_ax,
                               orientation="horizontal", extend="both")
        ticks = np.array([-1, -0.1, 0, 0.1, 1], dtype=float)
        colorbar.set_ticks(ticks[np.abs(ticks) <= color_limit])
        colorbar.set_label(r"$V/V_0$,  $V_0=p/(4\pi\epsilon_0L^2)$",
                           fontsize=11)
        fig.text(0.5, 0.025,
                 "White curves: electric field lines. "
                 "Colors: potential, with the same symmetric-log scale.\n"
                 "L is the physical dipole separation, used as a fixed "
                 "reference length in both panels.",
                 ha="center", fontsize=9, color="#60778a")
    return fig, axes


if __name__ == "__main__":
    fig, _ = visualize_dipoles()
    image_dir = Path(__file__).resolve().parent.parent / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    for extension in ("png", "svg"):
        fig.savefig(image_dir / f"dipole_comparison.{extension}",
                    dpi=220, facecolor="white")
    if plt.get_backend().lower() != "agg":
        plt.show()
