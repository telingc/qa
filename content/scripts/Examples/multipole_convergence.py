"""Compare cumulative multipole approximations using the shared heatmap tool.

Sources: +2q at z=a and -q at z=-a, with q>0 and a>0, in vacuum.
All functions use dimensionless x/a and z/a on the y=0 section and return
V/V0, where V0=q/(4*pi*epsilon_0*a). No physical source is placed at the origin.
Dependencies: NumPy, Matplotlib, and the previously created heatmap.py.
"""

from functools import partial
from pathlib import Path
from runpy import run_path

import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import numpy as np


def direct_potential(x, z):
    """Exact dimensionless Coulomb potential of the two finite point charges."""
    return 2 / np.hypot(x, z - 1) - 1 / np.hypot(x, z + 1)


def multipole_potential(x, z, order=0):
    """Cumulative expansion through order 0, 1, or 2, valid outside r/a=1."""
    if isinstance(order, bool) or order not in (0, 1, 2):
        raise ValueError("order must be 0, 1, or 2.")
    radius = np.hypot(x, z)
    result = 1 / radius
    if order >= 1:
        result = result + 3 * z / radius**3
    if order >= 2:
        result = result + (3 * z**2 - radius**2) / (2 * radius**5)
    return result


def _load_heatmap():
    """Resolve the same utility from either the vault or visualization copy."""
    script = Path(__file__).resolve()
    candidates = (
        script.with_name("heatmap.py"),
        script.parents[2] / "Nodes" / "scripts" / "heatmap.py",
    )
    for path in candidates:
        if path.is_file():
            return run_path(str(path))["plot_heatmap"]
    raise FileNotFoundError("Place heatmap.py beside this script or in Nodes/scripts.")


def visualize_multipole_convergence(extent=5.0, comparison_radius=2.0,
                                    resolution=401, *, color_limit=4.0,
                                    exclusion_radius=None):
    """Return (fig, axes, errors) for four panels with a shared color scale.

    All distances are in units of a. comparison_radius must exceed 1 and marks
    the outer circle for reporting errors, not a display mask. All finite
    values are displayed, including the external partial sums at r/a < 1.
    Inside this circle these are diagnostic expressions, not convergent
    approximations. Only mathematically undefined samples are hidden.
    color_limit sets a shared symmetric color range; larger magnitudes keep
    their original values but use saturated colors and colorbar extensions.
    errors contains sampled RMS and maximum absolute errors in V/V0 for both
    r/a >= comparison_radius and 1 < r/a < comparison_radius, excluding those
    singular points. exclusion_radius is a compatibility alias for older cells.
    These sampled errors are not rigorous bounds or pointwise monotonicity claims.
    """
    if exclusion_radius is not None:
        comparison_radius = exclusion_radius
    if (not np.all(np.isfinite([extent, comparison_radius, color_limit]))
            or not 1 < comparison_radius < extent
            or color_limit <= 0):
        raise ValueError(
            "Use 1 < comparison_radius < extent and finite color_limit > 0."
        )
    if (isinstance(resolution, bool)
            or not isinstance(resolution, (int, np.integer))
            or resolution < 21):
        raise ValueError("resolution must be an integer >= 21.")
    plot_heatmap = _load_heatmap()
    coordinates = np.linspace(-extent, extent, resolution)
    x, z = np.meshgrid(coordinates, coordinates)
    radius = np.hypot(x, z)
    far = radius >= comparison_radius
    near = (radius > 1) & (radius < comparison_radius)
    if not far.any() or not near.any():
        raise ValueError("Increase resolution so both comparison regions are sampled.")
    functions = [partial(multipole_potential, order=n) for n in range(3)]
    functions.append(direct_potential)
    with np.errstate(divide="ignore", invalid="ignore"):
        values = [func(x, z) for func in functions]
    errors = []
    for order, value in enumerate(values[:3]):
        difference = value[far] - values[-1][far]
        near_difference = value[near] - values[-1][near]
        errors.append({
            "order": order,
            "rms": float(np.sqrt(np.mean(difference**2))),
            "max_abs": float(np.max(np.abs(difference))),
            "rms_near": float(np.sqrt(np.mean(near_difference**2))),
            "max_abs_near": float(np.max(np.abs(near_difference))),
        })
    bound = float(color_limit)
    finite_min = min(float(np.min(value[np.isfinite(value)])) for value in values)
    finite_max = max(float(np.max(value[np.isfinite(value)])) for value in values)
    below, above = finite_min < -bound, finite_max > bound
    extend = (
        "both" if below and above else
        "min" if below else "max" if above else "neither"
    )
    ink = "#263e53"

    with plt.rc_context({"font.family": "DejaVu Sans", "font.size": 10,
                         "text.color": ink, "axes.labelcolor": ink,
                         "svg.fonttype": "none"}):
        fig, axes = plt.subplots(1, 4, figsize=(17.5, 7.2))
        fig.subplots_adjust(left=0.035, right=0.985, bottom=0.35,
                            top=0.79, wspace=0.23)
        fig.suptitle("Multipole Approximations vs. the Exact Potential",
                     fontsize=18, fontweight="bold", y=0.98)
        fig.text(0.5, 0.925,
                 r"$+2q$ at $z=a$; $-q$ at $z=-a$"
                 r"     |     $y=0$ section",
                 ha="center", fontsize=11)
        fig.text(0.5, 0.875,
                 r"Solid circle: $r=a$ (source bound)"
                 rf"     |     Dashed circle: $r={comparison_radius:g}a$"
                 r" (far-region comparison)", ha="center", fontsize=10)
        titles = ["Monopole only", "Through dipole", "Through quadrupole",
                  "Direct Coulomb sum"]
        meshes = []
        for index, (ax, func, title) in enumerate(zip(axes, functions, titles)):
            _, _, mesh = plot_heatmap(
                func, (-extent, extent), (-extent, extent),
                resolution=resolution, ax=ax,
                cmap="RdBu_r", scale="symlog", linthresh=0.05,
                vlim=(-bound, bound), title=title,
                xlabel=r"$x/a$", ylabel=r"$z/a$" if index == 0 else "",
                colorbar_label=r"$V/V_0$",
            )
            # The reusable utility creates a colorbar. Replace the four separate
            # bars with a single bar, preserving identical color normalization.
            mesh.colorbar.remove()
            meshes.append(mesh)
            ax.set_title(title, fontsize=12, pad=14)
            ax.set_xticks([-extent, 0, extent])
            ax.set_yticks([-extent, 0, extent])
            ax.add_patch(Circle(
                (0, 0), 1, fill=False,
                edgecolor=ink, linewidth=0.9, zorder=3,
            ))
            ax.add_patch(Circle(
                (0, 0), comparison_radius, fill=False,
                edgecolor="#8c5a12", linewidth=1.2,
                linestyle=(0, (5, 3)), zorder=3,
            ))
            ax.scatter([0, 0], [1, -1], s=28,
                       color=["#bd4d50", "#286b9b"], zorder=4)
            for position, label, color in (
                ((0, 1), r"$+2q$", "#bd4d50"),
                ((0, -1), r"$-q$", "#286b9b"),
            ):
                ax.annotate(label, position, xytext=(7, 0),
                            textcoords="offset points", va="center",
                            fontsize=9, color=color, zorder=5,
                            bbox={"facecolor": "white", "edgecolor": "none",
                                  "alpha": 0.8, "pad": 0.8})
            if index < 3:
                caption = rf"$n\leq {index}$"
                caption += f"  |  Far RMS: {errors[index]['rms']:.4f}"
                second_caption = f"Inner-annulus RMS: {errors[index]['rms_near']:.4f}"
            else:
                caption = "Exact reference"
                second_caption = "Both interior and exterior shown"
            position = ax.get_position()
            center = position.x0 + position.width / 2
            fig.text(center, 0.25, caption,
                     ha="center", va="center", fontsize=10)
            fig.text(center, 0.215, second_caption,
                     ha="center", va="center", fontsize=9, color="#60778a")

        colorbar_ax = fig.add_axes((0.34, 0.135, 0.32, 0.025))
        colorbar = fig.colorbar(meshes[-1], cax=colorbar_ax,
                               orientation="horizontal", extend=extend)
        ticks = np.array([-10, -1, -0.1, 0, 0.1, 1, 10], dtype=float)
        colorbar.set_ticks(ticks[np.abs(ticks) <= bound])
        colorbar.set_label(
            r"$V/V_0$,  $V_0=q/(4\pi\epsilon_0 a)$"
            "  (shared symmetric-log colors)", fontsize=10,
        )
        fig.text(0.5, 0.025,
                 "No regions are covered. Inside r=a, external partial sums "
                 "illustrate failure, not convergence.\n"
                 "Blank samples are undefined; saturated colors exceed the "
                 "shared limits. RMS errors are sampled, not rigorous bounds.",
                 ha="center", fontsize=9, color="#60778a")
    return fig, axes, errors


if __name__ == "__main__":
    fig, _, errors = visualize_multipole_convergence()
    image_dir = Path(__file__).resolve().parent.parent / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    for extension in ("png", "svg"):
        fig.savefig(image_dir / f"multipole_convergence.{extension}",
                    dpi=220, facecolor="white")
    for entry in errors:
        print(entry)
    if plt.get_backend().lower() != "agg":
        plt.show()
