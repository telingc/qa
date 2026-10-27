"""Variables in the electrostatic multipole expansion.

Requires NumPy and Matplotlib. The drawing is a schematic planar section of
a three-dimensional source, with a small cube representing a volume element.
It is not a quantitative drawing of the far-field distance ratio.
"""

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np


MULTIPOLE_STYLE = {
    "ink": "#263e53",
    "observation": "#286b9b",
    "source": "#39816c",
    "angle": "#bd752b",
    "distance": "#85739c",
    "cloud": "#e6eef0",
    "figsize": (10.0, 6.6),
    "font_size": 12,
}


def visualize_multipole_geometry(style=None):
    """Return (fig, ax) showing r, r-prime, alpha, rho, and d-tau-prime."""
    theme = {**MULTIPOLE_STYLE, **(style or {})}
    origin = np.zeros(2)
    source = np.array([-0.45, 1.4])
    observation = np.array([4.6, 2.3])
    source_angle = np.arctan2(source[1], source[0])
    observation_angle = np.arctan2(observation[1], observation[0])

    with plt.rc_context({"font.family": "DejaVu Sans",
                         "font.size": theme["font_size"],
                         "text.color": theme["ink"],
                         "mathtext.fontset": "dejavusans",
                         "svg.fonttype": "none"}):
        fig, ax = plt.subplots(figsize=theme["figsize"])
        fig.subplots_adjust(left=0.035, right=0.965, bottom=0.25, top=0.85)
        fig.suptitle("Multipole Expansion: Source and Observation Point",
                     y=0.97, fontsize=17, fontweight="bold")
        fig.text(0.5, 0.905,
                 r"$\mathbf{r}'$ varies over the source; "
                 r"$\mathbf{r}$ stays fixed during integration",
                 ha="center", fontsize=11)
        ax.set_aspect("equal")
        ax.set_xlim(-1.9, 5.4)
        ax.set_ylim(-1.45, 2.95)
        ax.axis("off")

        angle = np.linspace(0, 2 * np.pi, 240)
        cloud = np.column_stack((
            -0.32 + (1.05 + 0.13 * np.sin(3 * angle)) * np.cos(angle),
            0.36 + (1.55 + 0.12 * np.cos(5 * angle)) * np.sin(angle),
        ))
        ax.add_patch(Polygon(cloud, closed=True, facecolor=theme["cloud"],
                             edgecolor="#c9d7dc", linewidth=0.8, zorder=1))
        ax.text(-0.65, -0.68, r"$\rho(\mathbf{r}')$",
                color=theme["source"], fontsize=16, ha="center")

        ax.plot([source[0], observation[0]],
                [source[1], observation[1]], color=theme["distance"],
                linewidth=1.8, zorder=3)
        for endpoint, color in ((observation, theme["observation"]),
                                (source, theme["source"])):
            ax.annotate("", xy=endpoint, xytext=origin,
                        arrowprops={"arrowstyle": "-|>", "color": color,
                                    "lw": 2.5, "shrinkA": 0, "shrinkB": 0},
                        zorder=4)

        arc_radius = 0.55
        arc = np.linspace(observation_angle, source_angle, 100)
        ax.plot(arc_radius * np.cos(arc), arc_radius * np.sin(arc),
                color=theme["angle"], linewidth=1.7, zorder=5)
        middle_angle = (source_angle + observation_angle) / 2
        ax.text(0.79 * np.cos(middle_angle), 0.79 * np.sin(middle_angle),
                r"$\alpha$", color=theme["angle"], fontsize=20,
                ha="center", va="center", zorder=6)

        # A projected cube identifies a volume element, not a surface element.
        half_side = 0.09
        front = source + np.array([
            [-half_side, -half_side], [half_side, -half_side],
            [half_side, half_side], [-half_side, half_side],
        ])
        shift = np.array([0.11, 0.08])
        top = np.array([front[3], front[2], front[2] + shift, front[3] + shift])
        right = np.array([front[1], front[2], front[2] + shift, front[1] + shift])
        for vertices, face in ((right, "#c6ddd6"), (top, "#e8f3ef"),
                               (front, "#ffffff")):
            ax.add_patch(Polygon(vertices, closed=True, facecolor=face,
                                 edgecolor=theme["source"], linewidth=1.0,
                                 zorder=7))
        ax.annotate(r"$d\tau'$", xy=source + np.array([0.0, 0.17]),
                    xytext=(-0.92, 1.98), fontsize=18,
                    color=theme["source"], ha="center",
                    arrowprops={"arrowstyle": "-", "color": theme["source"],
                                "lw": 0.9}, zorder=8)
        ax.text(source[0] - 0.25, source[1] - 0.2, r"$S$",
                fontsize=13, color=theme["source"], ha="center")

        ax.scatter(*origin, s=38, color=theme["ink"], zorder=8)
        ax.annotate(r"$O$", origin, xytext=(-12, -22),
                    textcoords="offset points", fontsize=14)
        ax.scatter(*observation, s=45, color=theme["observation"], zorder=8)
        ax.annotate(r"$P:\ V(\mathbf{r})$", observation,
                    xytext=(10, 7), textcoords="offset points",
                    color=theme["observation"], fontsize=15)
        ax.text(-0.62, 0.61, r"$\mathbf{r}'$", fontsize=20,
                color=theme["source"], ha="center")
        ax.text(2.42, 0.86, r"$\mathbf{r}$", fontsize=20,
                color=theme["observation"], ha="center")
        ax.text(2.3, 2.16, r"$\ell=|\mathbf{r}-\mathbf{r}'|$",
                fontsize=15, color=theme["distance"], ha="center")

        fig.text(0.5, 0.145,
                 r"$V(\mathbf{r})=\frac{1}{4\pi\epsilon_0}"
                 r"\sum_{n=0}^{\infty}\frac{1}{r^{n+1}}"
                 r"\int (r')^n P_n(\cos\alpha)\,\rho(\mathbf{r}')\,d\tau'$",
                 ha="center", fontsize=17)
        fig.text(0.5, 0.058,
                 r"$r=|\mathbf{r}|$,  $r'=|\mathbf{r}'|$,  "
                 r"$\alpha=\angle(\mathbf{r},\mathbf{r}')$"
                 r"     |     $P_n$: Legendre polynomial; $n$: multipole order",
                 ha="center", fontsize=10.5)
    return fig, ax


if __name__ == "__main__":
    fig, _ = visualize_multipole_geometry()
    image_dir = Path(__file__).resolve().parent.parent / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    for extension in ("png", "svg"):
        fig.savefig(image_dir / f"multipole_geometry.{extension}",
                    dpi=220, facecolor="white")
    if plt.get_backend().lower() != "agg":
        plt.show()
