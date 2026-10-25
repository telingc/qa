"""Reusable heatmaps for real scalar functions of two coordinates.

Dependencies: NumPy and Matplotlib. Functions and optional masks must accept
NumPy arrays. This module neither shows nor saves figures automatically.
"""

from collections.abc import Callable

import matplotlib.pyplot as plt
from matplotlib.colors import LogNorm, Normalize, SymLogNorm
import numpy as np


def plot_heatmap(
    func: Callable,
    xlim: tuple[float, float],
    ylim: tuple[float, float],
    *,
    resolution: int = 401,
    mask: Callable | None = None,
    scale: str = "linear",
    vlim: tuple[float, float] | None = None,
    percentile: float | None = None,
    linthresh: float | None = None,
    cmap=None,
    contours: int = 0,
    title: str = "",
    xlabel: str = "$x$",
    ylabel: str = "$y$",
    colorbar_label: str = "$f(x,y)$",
    ax=None,
):
    """Plot func(X, Y); return (fig, ax, mesh) for overlays or saving.

    func must return real values broadcastable to the grid, including a scalar
    for a constant function. Nonfinite values and masked entries are hidden.
    mask(X, Y) returns True where values should be hidden; the function is
    still evaluated on the full grid, so undefined regions should return NaN.

    scale is 'linear', 'log', or 'symlog'. Log scale requires every unmasked
    finite value to be positive. A signed range uses symmetric color limits
    and a diverging colormap; one-sided data use a sequential colormap.

    vlim explicitly sets color limits. Optional percentile in (50, 100] trims
    color-limit tails only, not the data; colorbar arrows indicate saturation.
    For symlog, linthresh defines the linear interval around zero; the default
    is 1% of the largest absolute color limit. Grid density and axis limits
    always remain linear; scale changes the color normalization only.
    """
    for name, limits in (("xlim", xlim), ("ylim", ylim)):
        if len(limits) != 2 or not np.all(np.isfinite(limits)):
            raise ValueError(f"{name} must contain two finite numbers.")
        if limits[0] >= limits[1]:
            raise ValueError(f"{name} must be strictly increasing.")
    if (isinstance(resolution, bool)
            or not isinstance(resolution, (int, np.integer))
            or resolution < 2):
        raise ValueError("resolution must be an integer >= 2.")
    if scale not in ("linear", "log", "symlog"):
        raise ValueError("scale must be 'linear', 'log', or 'symlog'.")
    if percentile is not None:
        if not np.isfinite(percentile) or not 50 < percentile <= 100:
            raise ValueError("percentile must be in (50, 100].")
        if vlim is not None:
            raise ValueError("Choose either vlim or percentile, not both.")
    if linthresh is not None:
        if scale != "symlog" or not np.isfinite(linthresh) or linthresh <= 0:
            raise ValueError("linthresh must be positive and requires symlog.")
    if (isinstance(contours, bool)
            or not isinstance(contours, (int, np.integer)) or contours < 0):
        raise ValueError("contours must be a nonnegative integer.")

    x = np.linspace(*xlim, resolution)
    y = np.linspace(*ylim, resolution)
    x_grid, y_grid = np.meshgrid(x, y)
    # Singular samples can produce inf/NaN; these are hidden, not filled in.
    with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
        raw_values = np.ma.asarray(func(x_grid, y_grid))
    if np.iscomplexobj(raw_values):
        raise ValueError("func must return real values; choose real/imag/abs.")
    values = np.broadcast_to(
        np.asarray(raw_values.data, dtype=float), x_grid.shape,
    )
    hidden = np.broadcast_to(
        np.ma.getmaskarray(raw_values), x_grid.shape,
    ).copy()
    hidden |= ~np.isfinite(values)
    if mask is not None:
        user_mask = np.asarray(mask(x_grid, y_grid))
        if user_mask.dtype.kind != "b":
            raise ValueError("mask must return Boolean values.")
        hidden |= np.broadcast_to(user_mask, values.shape)
    data = np.ma.array(values, mask=hidden)
    finite = data.compressed()
    if finite.size == 0:
        raise ValueError("No finite, unmasked values to plot.")
    if scale == "log" and np.any(finite <= 0):
        raise ValueError("Log colors require positive values; use symlog for signs.")

    if vlim is not None:
        if (len(vlim) != 2 or not np.all(np.isfinite(vlim))
                or vlim[0] >= vlim[1]):
            raise ValueError("vlim must contain two finite, increasing numbers.")
        lower, upper = map(float, vlim)
    else:
        tail = 0 if percentile is None else 100 - percentile
        lower, upper = np.percentile(finite, [tail, 100 - tail])
        if finite.min() < 0 < finite.max():
            bound = float(np.percentile(np.abs(finite), 100 - tail))
            if bound == 0:
                bound = float(np.max(np.abs(finite)))
            lower, upper = -bound, bound
        if lower == upper:
            if scale == "log":
                lower, upper = lower / 1.1, upper * 1.1
            else:
                pad = abs(float(lower)) * 0.05 or 1.0
                lower, upper = lower - pad, upper + pad

    if scale == "log":
        if lower <= 0:
            raise ValueError("Log color limits must be positive.")
        norm = LogNorm(vmin=lower, vmax=upper)
    elif scale == "symlog":
        threshold = linthresh or 0.01 * max(abs(lower), abs(upper))
        norm = SymLogNorm(threshold, vmin=lower, vmax=upper)
    else:
        norm = Normalize(vmin=lower, vmax=upper)

    default_cmap = "RdBu_r" if lower < 0 < upper else "cividis"
    colors = plt.get_cmap(default_cmap if cmap is None else cmap).with_extremes(
        bad="#e5e9ed",
    )
    with plt.rc_context({"font.family": "DejaVu Sans", "font.size": 11,
                         "text.color": "#263e53",
                         "axes.labelcolor": "#263e53"}):
        if ax is None:
            fig, ax = plt.subplots(figsize=(8, 6.6), layout="constrained")
        else:
            fig = ax.figure
        mesh = ax.pcolormesh(x_grid, y_grid, data, shading="nearest",
                             cmap=colors, norm=norm, rasterized=True)
        if contours and finite.min() < finite.max():
            levels = np.linspace(lower, upper, contours + 2)[1:-1]
            levels = levels[(levels > finite.min()) & (levels < finite.max())]
            if levels.size:
                ax.contour(x_grid, y_grid, data, levels=levels,
                           colors="#263e53", linewidths=0.6, alpha=0.35)
        ax.set(xlim=xlim, ylim=ylim, aspect="equal", title=title,
               xlabel=xlabel, ylabel=ylabel)
        ax.set_axisbelow(False)
        ax.grid(color="#ffffff", alpha=0.16, linewidth=0.55)
        ax.spines[["top", "right"]].set_visible(False)
        below, above = finite.min() < lower, finite.max() > upper
        extend = (
            "both" if below and above else
            "min" if below else "max" if above else "neither"
        )
        colorbar = fig.colorbar(
            mesh, ax=ax, shrink=0.88, pad=0.025, extend=extend,
        )
        colorbar.set_label(colorbar_label)
    return fig, ax, mesh
