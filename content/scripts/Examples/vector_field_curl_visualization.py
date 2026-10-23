"""Reusable Cartesian vector-field plots and local-circulation checks."""

import numpy as np
import matplotlib.pyplot as plt


VECTOR_STYLE = {
    "field": "#286b9b",
    "curl": "#bd4545",
    "neutral": "#7b8995",
    "ink": "#243b50",
    "font_size": 11,
}


def field_a(x, y, z, k=1.0):
    x, y, z = np.broadcast_arrays(x, y, z)
    return k * np.stack((x * y, 2 * y * z, 3 * x * z), axis=-1)


def field_b(x, y, z, k=1.0):
    x, y, z = np.broadcast_arrays(x, y, z)
    return k * np.stack((y**2, 2 * x * y + z**2, 2 * y * z), axis=-1)


def _evaluate(field, points):
    points = np.asarray(points, dtype=float)
    if points.shape[-1] != 3:
        raise ValueError("points must have a final dimension of length 3.")
    values = np.asarray(field(*np.moveaxis(points, -1, 0)), dtype=float)
    if values.shape != points.shape or not np.all(np.isfinite(values)):
        raise ValueError("field must return finite vectors with shape (..., 3).")
    return values


def numerical_curl(field, point, h=1e-4):
    """Approximate curl with centered Cartesian differences."""
    point = np.asarray(point, dtype=float)
    if point.shape != (3,) or not np.isfinite(h) or h <= 0:
        raise ValueError("Use a 3D point and a finite positive h.")
    steps = h * np.eye(3)
    jacobian = (
        _evaluate(field, point + steps) - _evaluate(field, point - steps)
    ).T / (2 * h)
    return np.array([
        jacobian[2, 1] - jacobian[1, 2],
        jacobian[0, 2] - jacobian[2, 0],
        jacobian[1, 0] - jacobian[0, 1],
    ])


def examine_curl(field, points, h=1e-4):
    values = np.array([numerical_curl(field, p, h) for p in points])
    for point, value in zip(points, values):
        print(f"P = {np.asarray(point)}: curl approximately {value}")
    return values


def _circle(center, radius, normal, samples=720):
    center = np.asarray(center, dtype=float)
    normal = np.asarray(normal, dtype=float)
    if radius <= 0 or not np.isfinite(radius) or np.linalg.norm(normal) == 0:
        raise ValueError("Use a positive radius and a nonzero normal.")
    normal = normal / np.linalg.norm(normal)
    axis = np.eye(3)[np.argmin(np.abs(normal))]
    u = np.cross(normal, axis)
    u /= np.linalg.norm(u)
    v = np.cross(normal, u)
    angle = 2 * np.pi * np.arange(samples) / samples
    points = center + radius * (
        np.cos(angle)[:, None] * u + np.sin(angle)[:, None] * v
    )
    tangents = radius * (
        -np.sin(angle)[:, None] * u + np.cos(angle)[:, None] * v
    )
    return points, tangents


def circle_circulation(field, center=(1, 0, 0), radius=0.3,
                       normal=(0, 0, -1), samples=720):
    """Line integral on an oriented circle; not an integral of field magnitude."""
    points, tangents = _circle(center, radius, normal, samples)
    return np.sum(_evaluate(field, points) * tangents) * 2 * np.pi / samples


def _settings(style):
    theme = {**VECTOR_STYLE, **(style or {})}
    rc = {
        "font.family": "DejaVu Sans", "font.size": theme["font_size"],
        "grid.color": (0.55, 0.63, 0.70, 0.30), "grid.linewidth": 0.6,
    }
    return theme, rc


def visualize_vector_fields(fields, *, extent=1.5, grid_size=5,
                            center=(1, 0, 0), loop_radius=0.3, style=None):
    """Plot (callable, title) pairs using one common field-arrow scale.

    The first field supplies the highlighted local curl axis. A drawn circle is
    a chosen integration path, rather than a field line or particle trajectory.
    """
    if not fields or extent <= 0 or grid_size < 2:
        raise ValueError("Provide fields, a positive extent, and grid_size >= 2.")
    theme, rc = _settings(style)
    center = np.asarray(center, dtype=float)
    reference_curl = numerical_curl(fields[0][0], center)
    curl_size = np.linalg.norm(reference_curl)
    normal = reference_curl / curl_size if curl_size > 1e-10 else np.array([0, 0, -1])
    circle, tangents = _circle(center, loop_radius, normal)
    coordinates = np.linspace(-extent, extent, grid_size)
    points = np.stack(np.meshgrid(coordinates, coordinates, coordinates,
                                 indexing="ij"), axis=-1).reshape(-1, 3)
    values = [_evaluate(func, points) for func, _ in fields]
    max_field = max(np.max(np.linalg.norm(value, axis=-1)) for value in values)
    arrow_scale = 0.28 * extent / (max_field or 1.0)

    with plt.rc_context(rc):
        fig = plt.figure(figsize=(6.7 * len(fields), 6.5), facecolor="white")
        axes = []
        for index, ((func, title), vectors) in enumerate(zip(fields, values)):
            ax = fig.add_subplot(1, len(fields), index + 1, projection="3d",
                                 computed_zorder=False)
            axes.append(ax)
            ax.quiver(*points.T, *(arrow_scale * vectors).T,
                      color=theme["field"], linewidth=0.9, alpha=0.66,
                      arrow_length_ratio=0.25, normalize=False, zorder=2)
            color = theme["curl"] if index == 0 else theme["neutral"]
            closed = np.vstack((circle, circle[0]))
            ax.plot(*closed.T, color=color, linewidth=2.4, zorder=5)
            marks = np.arange(0, len(circle), len(circle) // 4)
            directions = tangents[marks] / loop_radius * 0.13
            ax.quiver(*circle[marks].T, *directions.T, color=color,
                      linewidth=1.9, arrow_length_ratio=0.6, zorder=6)
            local_curl = numerical_curl(func, center)
            if np.linalg.norm(local_curl) > 1e-10:
                curl_arrow = 0.7 * local_curl / np.linalg.norm(local_curl)
                ax.quiver(*center, *curl_arrow, color=theme["curl"],
                          linewidth=3.0, arrow_length_ratio=0.2, zorder=7)
                ax.text(*(center + 1.12 * curl_arrow), r"$\nabla\times\mathbf{E}_a(P)$",
                        color=theme["curl"], fontsize=11, zorder=8)
            ax.scatter(*center, s=28, color=theme["ink"], zorder=8)
            ax.text(*(center + [0.05, 0.05, 0.12]), "P", zorder=8)
            bound = 1.25 * extent
            ax.set(xlim=(-bound, bound), ylim=(-bound, bound), zlim=(-bound, bound),
                   xlabel="$x$", ylabel="$y$", zlabel="$z$", title=title)
            for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
                axis.set_ticks([-extent, 0, extent])
                axis.set_pane_color((0.95, 0.97, 0.98, 0.6))
            ax.grid(True)
            ax.set_proj_type("ortho")
            ax.set_box_aspect((1, 1, 1))
            ax.view_init(elev=25, azim=-57)
        fig.suptitle("Two Vector Fields: Local Curl and Circulation", fontsize=17, y=0.97)
        fig.subplots_adjust(top=0.86, bottom=0.16, left=0.02, right=0.98, wspace=0.03)
        fig.text(0.5, 0.08, "Blue: field vectors (one common scale).  "
                 "Red: nonzero curl and its right-hand circulation direction.",
                 ha="center", color=theme["ink"])
        fig.text(0.5, 0.035, "The circles are integration paths, not field lines. "
                 "The next figure magnifies the z = 0 plane.",
                 ha="center", color=theme["ink"], fontsize=10)
    return fig, axes


def visualize_xy_circulation(fields, *, center=(1, 0, 0), loop_radius=0.3,
                             half_width=0.6, normal_sign=-1, style=None):
    """Compare identical circles in horizontal planes; normal_sign sets orientation."""
    if not fields or half_width <= loop_radius or normal_sign not in (-1, 1):
        raise ValueError("Require fields, half_width > loop_radius, and normal_sign = +/-1.")
    theme, rc = _settings(style)
    center = np.asarray(center, dtype=float)
    circle, tangents = _circle(center, loop_radius, (0, 0, normal_sign))
    sampled_width = 0.7 * half_width
    x, y = np.meshgrid(np.linspace(center[0] - sampled_width, center[0] + sampled_width, 11),
                       np.linspace(center[1] - sampled_width, center[1] + sampled_width, 11))
    points = np.stack((x, y, np.full_like(x, center[2])), axis=-1)
    values = [_evaluate(func, points) for func, _ in fields]
    max_field = max(np.max(np.linalg.norm(value[..., :2], axis=-1)) for value in values)
    arrow_scale = 0.30 * half_width / (max_field or 1.0)
    with plt.rc_context(rc):
        fig, axes = plt.subplots(1, len(fields), figsize=(6.0 * len(fields), 6.0),
                                 squeeze=False, facecolor="white")
        for index, ((func, title), vectors) in enumerate(zip(fields, values)):
            ax = axes[0, index]
            color = theme["curl"] if index == 0 else theme["neutral"]
            ax.quiver(x, y, arrow_scale * vectors[..., 0], arrow_scale * vectors[..., 1],
                      angles="xy", scale_units="xy", scale=1, color=theme["field"],
                      width=0.003, headwidth=3, headlength=3.5, zorder=2)
            ax.fill(circle[:, 0], circle[:, 1], color=color, alpha=0.07, zorder=1)
            closed = np.vstack((circle, circle[0]))
            ax.plot(closed[:, 0], closed[:, 1], color=color, linewidth=2.3, zorder=4)
            marks = np.arange(0, len(circle), len(circle) // 4)
            arrow = tangents[marks, :2] / loop_radius * 0.07
            ax.quiver(circle[marks, 0], circle[marks, 1], arrow[:, 0], arrow[:, 1],
                      angles="xy", scale_units="xy", scale=1, color=color,
                      width=0.007, headwidth=4.0, zorder=5)
            ax.scatter(*center[:2], color=theme["ink"], s=25, zorder=6)
            ax.annotate("P", center[:2], xytext=(6, 7), textcoords="offset points")
            circulation = circle_circulation(func, center, loop_radius, (0, 0, normal_sign))
            loop_scale = 2 * np.pi * loop_radius * np.max(
                np.linalg.norm(_evaluate(func, circle), axis=-1)
            )
            roundoff = 64 * np.finfo(float).eps * loop_scale
            displayed = "0" if abs(circulation) <= roundoff else f"{circulation:.6g}"
            curl_z = numerical_curl(func, center)[2]
            ax.set(xlim=(center[0] - half_width, center[0] + half_width),
                   ylim=(center[1] - half_width, center[1] + half_width),
                   xlabel="$x$", ylabel="$y$", aspect="equal",
                   title=title + "\n" + rf"$(\nabla\times\mathbf{{E}})_z(P)={curl_z:.3g}$")
            ax.grid(True)
            ax.text(0.5, -0.19, rf"$\oint_C\mathbf{{E}}\cdot d\mathbf{{l}}"
                    rf"\approx {displayed}$", transform=ax.transAxes,
                    ha="center", color=color, fontsize=13)
        direction = "Clockwise" if normal_sign < 0 else "Counterclockwise"
        fig.suptitle(f"{direction} Test Loop in the z = {center[2]:g} Plane", fontsize=17, y=0.97)
        fig.subplots_adjust(top=0.81, bottom=0.22, wspace=0.25)
        fig.text(0.5, 0.035, "Blue arrows are the field. "
                 "The oriented circle measures circulation; it is not a field line.",
                 ha="center", color=theme["ink"], fontsize=10)
    return fig, axes[0]


if __name__ == "__main__":
    fields = [(field_a, r"$\mathbf{E}_a$: nonzero curl"),
              (field_b, r"$\mathbf{E}_b$: zero curl")]
    for func, name in fields:
        print(name)
        examine_curl(func, [(1, 0, 0), (1, 1, 1)])
    visualize_vector_fields(fields)
    visualize_xy_circulation(fields)
    plt.show()
