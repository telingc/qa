"""Source-angle geometry and a neutral electric dipole, in a 2-D section.

Requires NumPy and Matplotlib. Coordinates are schematic, not a far-field
scale drawing. The source angle alpha and dipole angle theta are distinct.
"""

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
import numpy as np


STYLE = {
    "ink": "#263e53",
    "observation": "#286b9b",
    "source": "#39816c",
    "projection": "#bd752b",
    "positive": "#bd4d50",
    "negative": "#286b9b",
    "figsize": (12.8, 6.3),
}


def _arrow(ax, start, end, color, linewidth=2.2):
    ax.annotate("", xy=end, xytext=start,
                arrowprops={"arrowstyle": "-|>", "color": color,
                            "lw": linewidth, "shrinkA": 0, "shrinkB": 0},
                zorder=4)


def _angle_arc(ax, first, second, radius, color):
    angles = np.linspace(first, second, 100)
    ax.plot(radius * np.cos(angles), radius * np.sin(angles),
            color=color, linewidth=1.5, zorder=4)


def visualize_dipole_geometry(style=None):
    """Return (fig, axes): source angle alpha versus dipole angle theta."""
    theme = {**STYLE, **(style or {})}
    with plt.rc_context({"font.family": "DejaVu Sans", "font.size": 11,
                         "text.color": theme["ink"],
                         "mathtext.fontset": "dejavusans"}):
        fig, axes = plt.subplots(1, 2, figsize=theme["figsize"])
        fig.subplots_adjust(left=0.035, right=0.985, bottom=0.19,
                            top=0.79, wspace=0.16)
        fig.suptitle("Dipole Potential: Geometry and Charge Separation",
                     fontsize=17, fontweight="bold", y=0.96)
        fig.text(0.5, 0.89, "Schematic sections through three-dimensional space",
                 ha="center", fontsize=11)
        for ax in axes:
            ax.set_aspect("equal")
            ax.set_facecolor("#f7f9fb")
            ax.grid(color="#dfe6eb", linewidth=0.6)
            ax.tick_params(left=False, bottom=False, labelleft=False,
                           labelbottom=False)
            for spine in ax.spines.values():
                spine.set_visible(False)

        ax = axes[0]
        ax.set_title("One source element", fontsize=13, pad=16)
        ax.set_xlim(-1.5, 5.3)
        ax.set_ylim(-1.3, 2.9)
        origin = np.zeros(2)
        source = np.array([1.05, 1.55])
        observation = np.array([4.7, 0.75])
        r_hat = observation / np.linalg.norm(observation)
        projected_length = float(np.dot(source, r_hat))
        projection = projected_length * r_hat
        source_angle = np.arctan2(source[1], source[0])
        observation_angle = np.arctan2(observation[1], observation[0])

        angles = np.linspace(0, 2 * np.pi, 200)
        cloud = np.column_stack((
            0.1 + (1.3 + 0.1 * np.sin(3 * angles)) * np.cos(angles),
            0.45 + (1.5 + 0.08 * np.cos(4 * angles)) * np.sin(angles),
        ))
        ax.add_patch(Polygon(cloud, facecolor=theme["source"], alpha=0.08,
                             edgecolor="none", zorder=1))
        _arrow(ax, origin, observation, theme["observation"])
        _arrow(ax, origin, source, theme["source"])
        ax.plot([source[0], observation[0]],
                [source[1], observation[1]], color="#99a7b2",
                linestyle="--", linewidth=1.2, zorder=2)
        ax.plot([source[0], projection[0]],
                [source[1], projection[1]], color=theme["projection"],
                linestyle="--", linewidth=1.4, zorder=3)
        ax.plot([0, projection[0]], [0, projection[1]],
                color=theme["projection"], linewidth=3, zorder=5)

        perpendicular = np.array([-r_hat[1], r_hat[0]])
        corner = np.array([
            projection - 0.13 * r_hat,
            projection - 0.13 * r_hat + 0.13 * perpendicular,
            projection + 0.13 * perpendicular,
        ])
        ax.plot(corner[:, 0], corner[:, 1],
                color=theme["projection"], linewidth=0.9)
        _angle_arc(ax, observation_angle, source_angle, 0.63, theme["ink"])
        midpoint_angle = (source_angle + observation_angle) / 2
        ax.text(0.84 * np.cos(midpoint_angle),
                0.84 * np.sin(midpoint_angle), r"$\alpha$", fontsize=17,
                ha="center", va="center")
        ax.scatter([0, source[0], observation[0], projection[0]],
                   [0, source[1], observation[1], projection[1]], s=28,
                   color=[theme["ink"], theme["source"],
                          theme["observation"], theme["projection"]], zorder=6)
        ax.annotate(r"$O$", origin, xytext=(-13, -20),
                    textcoords="offset points", fontsize=13)
        ax.annotate(r"$P$", observation, xytext=(7, 8),
                    textcoords="offset points", fontsize=14,
                    color=theme["observation"])
        ax.annotate(r"$S:\ dq=\rho(\mathbf{r}')\,d\tau'$", source,
                    xytext=(-18, 23), textcoords="offset points",
                    color=theme["source"], fontsize=12)
        ax.annotate(r"$H$", projection, xytext=(7, -18),
                    textcoords="offset points", color=theme["projection"])
        ax.text(0.1, 1.05, r"$\mathbf{r}'$", fontsize=17,
                color=theme["source"])
        ax.text(3.25, 0.23, r"$\mathbf{r}$", fontsize=17,
                color=theme["observation"])
        ax.text(3.0, 1.4, r"$|\mathbf{r}-\mathbf{r}'|$",
                color="#788a99", fontsize=12)
        ax.text(0.63, -0.45, r"$OH=r'\cos\alpha$",
                color=theme["projection"], fontsize=13)

        ax = axes[1]
        ax.set_title(r"Neutral pair: $Q=0$, $\mathbf{p}\ne\mathbf{0}$",
                     fontsize=13, pad=16)
        ax.set_xlim(-1.55, 3.9)
        ax.set_ylim(-1.25, 2.95)
        positive = np.array([0, 0.7])
        negative = np.array([0, -0.7])
        observation = np.array([3.25, 2.1])
        for charge, color in ((positive, theme["positive"]),
                              (negative, theme["negative"])):
            ax.plot([charge[0], observation[0]],
                    [charge[1], observation[1]], color=color,
                    alpha=0.4, linewidth=1.3, linestyle="--")
        _arrow(ax, origin, observation, theme["observation"])
        ax.axvline(0, color="#a6b5c0", linewidth=0.8, zorder=1)
        ax.text(0.08, 2.65, r"$z$", fontsize=12, color="#788a99")
        _arrow(ax, np.array([-0.6, -0.7]), np.array([-0.6, 0.7]),
               theme["source"], linewidth=2.5)
        ax.text(-0.85, 0.0, r"$\mathbf{p}$", fontsize=18,
                color=theme["source"], ha="center", va="center")
        ax.annotate("", xy=(0.39, 0.7), xytext=(0.39, -0.7),
                    arrowprops={"arrowstyle": "<->",
                                "color": theme["ink"], "lw": 1.0})
        ax.text(0.52, -0.15, r"$d$", fontsize=14)
        ax.scatter(*positive, s=220, color=theme["positive"], zorder=6)
        ax.scatter(*negative, s=220, color=theme["negative"], zorder=6)
        ax.text(*positive, "+", color="white", fontsize=16,
                ha="center", va="center", zorder=7)
        ax.text(*negative, "−", color="white", fontsize=16,
                ha="center", va="center", zorder=7)
        ax.annotate(r"$+q$", positive, xytext=(-28, 9),
                    textcoords="offset points", color=theme["positive"])
        ax.annotate(r"$-q$", negative, xytext=(-28, -14),
                    textcoords="offset points", color=theme["negative"])
        ax.scatter(*origin, s=22, color=theme["ink"], zorder=6)
        ax.annotate(r"$O$", origin, xytext=(-15, -14),
                    textcoords="offset points")
        ax.scatter(*observation, s=28, color=theme["observation"], zorder=6)
        ax.annotate(r"$P$", observation, xytext=(6, 7),
                    textcoords="offset points", fontsize=14,
                    color=theme["observation"])
        ax.text(2.2, 1.0, r"$\mathbf{r}$", fontsize=17,
                color=theme["observation"])
        observation_angle = np.arctan2(observation[1], observation[0])
        _angle_arc(ax, observation_angle, np.pi / 2, 1.04, theme["ink"])
        middle = (observation_angle + np.pi / 2) / 2
        ax.text(1.25 * np.cos(middle), 1.25 * np.sin(middle),
                r"$\theta$", fontsize=17, ha="center", va="center")

        fig.text(0.265, 0.11,
                 r"$r'\cos\alpha=\hat{\mathbf{r}}\cdot\mathbf{r}'$",
                 ha="center", color=theme["projection"], fontsize=16)
        fig.text(0.755, 0.11,
                 r"$\mathbf{p}=q\mathbf{r}'_+-q\mathbf{r}'_-=qd\,\hat{\mathbf{z}}$",
                 ha="center", color=theme["source"], fontsize=15)
        fig.text(0.5, 0.035,
                 r"$\alpha=\angle(\mathbf{r}',\mathbf{r})$"
                 r"     |     $\theta=\angle(\mathbf{p},\mathbf{r})$",
                 ha="center", fontsize=12)
    return fig, axes


if __name__ == "__main__":
    fig, _ = visualize_dipole_geometry()
    image_dir = Path(__file__).resolve().parent.parent / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    fig.savefig(image_dir / "dipole_angle_geometry.png", dpi=220,
                facecolor="white")
    fig.savefig(image_dir / "dipole_angle_geometry.svg", facecolor="white")
    if plt.get_backend().lower() != "agg":
        plt.show()
