"""Geometry of the source integral on a grounded conducting plane.

Requires NumPy and Matplotlib. All plotted coordinates are schematic lengths.
The finite annular sectors represent infinitesimal area elements; no charge
density or induced-charge solution is assumed.
"""

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Circle, Polygon
import numpy as np


GEOMETRY_STYLE = {
    "ink": "#263e53",
    "observation": "#286b9b",
    "radius": "#bd752b",
    "distance": "#bd4d50",
    "element": "#39816c",
    "grid": "#dce4e9",
    "figsize": (12.0, 7.7),
    "font_size": 11,
}


def polar_point(radius, angle):
    """Cartesian coordinates; angle is in radians."""
    return np.array([radius * np.cos(angle), radius * np.sin(angle)])


def annular_sector(radius, angle, radial_width, angular_width):
    """Vertices of a finite sector used to illustrate r dr dphi."""
    angles = np.linspace(angle, angle + angular_width, 100)
    inner = radius * np.column_stack((np.cos(angles), np.sin(angles)))
    outer = (radius + radial_width) * np.column_stack(
        (np.cos(angles[::-1]), np.sin(angles[::-1]))
    )
    return np.vstack((inner, outer))


def visualize_plane_potential_geometry(s=3.4, r=2.35, phi=np.pi / 3,
                                       style=None):
    """Return (fig, axes) showing fixed P, variable source, and area element.

    s and r must be positive, and 0 < phi < pi/2. These restrictions keep the
    schematic labels readable; they do not restrict the physical integral.
    """
    if (not np.all(np.isfinite([s, r, phi]))
            or s <= 0 or r <= 0 or not 0 < phi < np.pi / 2):
        raise ValueError("Use finite s > 0, r > 0, and 0 < phi < pi/2.")
    theme = {**GEOMETRY_STYLE, **(style or {})}
    scale = max(s, r)
    source = polar_point(r, phi)
    observation = np.array([s, 0.0])

    with plt.rc_context({"font.family": "DejaVu Sans",
                         "font.size": theme["font_size"],
                         "text.color": theme["ink"],
                         "mathtext.fontset": "dejavusans"}):
        fig, axes = plt.subplots(
            1, 2, figsize=theme["figsize"],
            gridspec_kw={"width_ratios": [1.55, 1]},
        )
        fig.subplots_adjust(left=0.035, right=0.98, top=0.83,
                            bottom=0.20, wspace=0.14)
        ax, detail = axes
        fig.suptitle("Potential integral on the conducting plane", y=0.97,
                     fontsize=17, fontweight="bold")
        fig.text(0.5, 0.905,
                 r"Top view: $z=0$    |    $s$ fixed; $r,\phi$ vary",
                 ha="center", color=theme["ink"], fontsize=11)

        ax.set_aspect("equal")
        ax.set_facecolor("#f6f8fa")
        circle_margin = 0.12 * scale
        ax.set_xlim(-r - circle_margin,
                    max(1.18 * s, r + circle_margin))
        ax.set_ylim(-r - circle_margin, r + circle_margin)
        step = scale / 7
        ax.set_xticks(np.arange(-r, max(s, r) + step, step))
        ax.set_yticks(np.arange(-r, r + step, step))
        ax.grid(color=theme["grid"], linewidth=0.65, zorder=0)
        ax.tick_params(left=False, bottom=False, labelleft=False,
                       labelbottom=False)
        for spine in ax.spines.values():
            spine.set_visible(False)

        # Every point on this circle has the same source radius r.
        ax.add_patch(Circle(
            (0, 0), r, fill=False, edgecolor=theme["radius"],
            linewidth=1.5, linestyle=(0, (5, 4)), alpha=0.6, zorder=2,
        ))
        ax.add_patch(Polygon(
            np.array([[0, 0], observation, source]), closed=True,
            facecolor=theme["observation"], alpha=0.045, edgecolor="none",
            zorder=1,
        ))
        for start, end, color in (
            (np.zeros(2), observation, theme["observation"]),
            (np.zeros(2), source, theme["radius"]),
            (source, observation, theme["distance"]),
        ):
            ax.plot([start[0], end[0]], [start[1], end[1]],
                    color=color, linewidth=2.5, zorder=3)

        ax.add_patch(Polygon(
            annular_sector(r, phi, scale * 0.07, 0.12),
            facecolor=theme["element"], edgecolor=theme["element"],
            alpha=0.5, zorder=4,
        ))
        angle_arc = np.linspace(0, phi, 100)
        arc_radius = scale * 0.16
        ax.plot(arc_radius * np.cos(angle_arc),
                arc_radius * np.sin(angle_arc),
                color=theme["element"], linewidth=1.5)
        angle_label = polar_point(arc_radius * 1.3, phi / 2)
        ax.text(*angle_label, r"$\phi$", color=theme["element"],
                fontsize=15, ha="center", va="center")

        ax.scatter([0, s, source[0]], [0, 0, source[1]],
                   color=[theme["ink"], theme["observation"],
                          theme["element"]], s=40, zorder=5)
        ax.annotate(r"$O$", (0, 0), xytext=(-12, -19),
                    textcoords="offset points", fontsize=13)
        ax.annotate(r"$P=(s,0,0)$", observation, xytext=(0, -25),
                    textcoords="offset points", ha="center",
                    color=theme["observation"], fontsize=12)
        ax.annotate(r"$S=(r\cos\phi,r\sin\phi,0)$", source,
                    xytext=(-5, 35), textcoords="offset points",
                    ha="center", color=theme["element"], fontsize=12)
        ax.text(s * 0.55, -scale * 0.065, r"$s$",
                color=theme["observation"], fontsize=16, ha="center")
        radial_label = source * 0.56 + polar_point(scale * 0.07, phi + np.pi/2)
        ax.text(*radial_label, r"$r$", color=theme["radius"],
                fontsize=16, ha="center")
        ax.annotate(r"$\ell=|P-S|$", (observation + source) / 2,
                    xytext=(12, 12), textcoords="offset points",
                    color=theme["distance"], fontsize=13)

        # Enlarge a representative sector, retaining the same angular origin.
        radius = 2.0
        dr = 0.68
        dphi = 0.27
        angle = 0.55
        detail.set_aspect("equal")
        detail.axis("off")
        detail.set_title("Enlarged source element", fontsize=13, pad=20)
        detail.add_patch(Polygon(
            annular_sector(radius, angle, dr, dphi),
            facecolor=theme["element"], alpha=0.18, edgecolor="none",
        ))
        for rad in (radius, radius + dr):
            angles = np.linspace(angle, angle + dphi, 100)
            detail.plot(rad * np.cos(angles), rad * np.sin(angles),
                        color=theme["element"], linewidth=2)
        for ang in (angle, angle + dphi):
            ends = np.array([polar_point(radius, ang),
                             polar_point(radius + dr, ang)])
            detail.plot(ends[:, 0], ends[:, 1],
                        color=theme["element"], linewidth=2)

        radial_offset = -0.15 * polar_point(1, angle + np.pi / 2)
        ends = [polar_point(rad, angle) + radial_offset
                for rad in (radius, radius + dr)]
        detail.annotate("", xy=ends[1], xytext=ends[0],
                        arrowprops={"arrowstyle": "<->",
                                    "color": theme["radius"], "lw": 1.5})
        detail.text(*((ends[0] + ends[1]) / 2 + radial_offset),
                    r"$dr$", color=theme["radius"], fontsize=16,
                    ha="center", va="center")

        arc_angles = np.linspace(angle, angle + dphi, 100)
        dimension_radius = radius - 0.15
        arc_points = dimension_radius * np.column_stack(
            (np.cos(arc_angles), np.sin(arc_angles))
        )
        detail.plot(arc_points[:, 0], arc_points[:, 1],
                    color=theme["observation"], linewidth=1.3)
        for index, neighbor in ((0, 6), (-1, -7)):
            detail.annotate("", xy=arc_points[index],
                            xytext=arc_points[neighbor],
                            arrowprops={"arrowstyle": "->",
                                        "color": theme["observation"],
                                        "lw": 1.3})
        label_position = polar_point(radius - 0.55, angle + dphi / 2)
        detail.text(*label_position, r"$r\,d\phi$",
                    color=theme["observation"], fontsize=16,
                    ha="center", va="center")
        detail.text(*polar_point(radius + dr / 2, angle + dphi / 2),
                    r"$dS$", color=theme["element"], fontsize=17,
                    ha="center", va="center")
        detail.set_xlim(0.85, 2.72)
        detail.set_ylim(0.55, 2.18)

        fig.text(0.32, 0.115,
                 r"$\ell^2=r^2+s^2-2rs\cos\phi$", ha="center",
                 color=theme["distance"], fontsize=17)
        fig.text(0.79, 0.115,
                 r"$dS=r\,dr\,d\phi$", ha="center",
                 color=theme["element"], fontsize=17)
        fig.text(0.79, 0.055,
                 r"$dq=\sigma(r)\,r\,dr\,d\phi$", ha="center",
                 color=theme["element"], fontsize=14)
    return fig, axes


if __name__ == "__main__":
    figure, _ = visualize_plane_potential_geometry()
    image_dir = Path(__file__).resolve().parent.parent / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    figure.savefig(image_dir / "plane_potential_geometry.png", dpi=220,
                   facecolor="white")
    if plt.get_backend().lower() != "agg":
        plt.show()
