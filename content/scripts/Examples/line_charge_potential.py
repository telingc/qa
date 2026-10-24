import numpy as np
import matplotlib.pyplot as plt


WIRE_STYLE = {
    "curve": "#286b9b",
    "reference": "#bd752b",
    "ink": "#243b50",
    "figsize": (8.0, 5.5),
    "font_size": 11,
}


def wire_potential(s, line_charge=1.0, reference_distance=1.0,
                   epsilon_0=1.0, reference_potential=0.0):
    """Potential of an infinite line charge; s and s0 must be positive.

    Use consistent units: SI inputs produce potential in volts. No reference
    at infinity is imposed. An additive constant is set by reference_potential.
    """
    s = np.asarray(s, dtype=float)
    if (np.any(~np.isfinite(s)) or np.any(s <= 0)
            or not np.isfinite(reference_distance) or reference_distance <= 0
            or not np.isfinite(epsilon_0) or epsilon_0 <= 0
            or not np.isfinite(line_charge)
            or not np.isfinite(reference_potential)):
        raise ValueError("Use finite parameters with s > 0, s0 > 0, epsilon_0 > 0.")
    return (reference_potential - line_charge / (2 * np.pi * epsilon_0)
            * np.log(s / reference_distance))


def visualize_wire_potential(line_charge=1.0, reference_distance=1.0,
                             epsilon_0=1.0, distance_range=(0.05, 5.0),
                             style=None):
    """Plot V(s0)=0 with normalized distance and potential, using one curve.

    distance_range is measured in units of s0 and must include s/s0=1.
    V0=abs(lambda)/(2*pi*epsilon_0); for zero charge the graph uses V directly.
    """
    lower, upper = distance_range
    if (not np.isfinite(lower) or not np.isfinite(upper)
            or not 0 < lower < 1 < upper):
        raise ValueError("distance_range must satisfy 0 < lower < 1 < upper.")
    theme = {**WIRE_STYLE, **(style or {})}
    scaled_distance = np.geomspace(lower, upper, 800)
    potential = wire_potential(
        reference_distance * scaled_distance, line_charge,
        reference_distance, epsilon_0,
    )
    scale = abs(line_charge) / (2 * np.pi * epsilon_0) or 1.0
    values = potential / scale

    with plt.rc_context({"font.family": "DejaVu Sans",
                         "font.size": theme["font_size"]}):
        fig, ax = plt.subplots(figsize=theme["figsize"], layout="constrained")
        ax.plot(scaled_distance, values, color=theme["curve"], linewidth=2.5)
        ax.axhline(0, color=theme["ink"], linewidth=0.9, alpha=0.65)
        ax.axvline(1, color=theme["reference"], linewidth=1.0,
                   linestyle="--", alpha=0.65)
        ax.scatter(1, 0, s=48, color=theme["reference"], zorder=4)
        ax.annotate(
            r"$V(s_0)=0$", xy=(1, 0), xytext=(0.30, 0.58),
            textcoords="axes fraction",
            color=theme["reference"],
            arrowprops={"arrowstyle": "-", "color": theme["reference"], "lw": 0.9},
        )
        padding = 0.12 * max(float(np.ptp(values)), 1.0)
        ax.set(
            xlim=(0, upper),
            ylim=(float(np.min(values)) - padding, float(np.max(values)) + padding),
            xlabel=r"$s/s_0$", ylabel=r"$V/V_0$" if line_charge else "$V$",
            title="Infinite Line-Charge Potential",
        )
        ax.grid(color=theme["ink"], alpha=0.14, linewidth=0.6)
        ax.spines[["top", "right"]].set_visible(False)
    return fig, ax


if __name__ == "__main__":
    fig, ax = visualize_wire_potential()
    plt.show()
