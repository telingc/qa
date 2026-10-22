import numpy as np
import matplotlib.pyplot as plt
from matplotlib import colors
from mpl_toolkits.mplot3d import proj3d


RADIAL_STYLE = {
    "field": "#286b9b",
    "sphere": "#70acd0",
    "shell": "#d77f22",
    "normal": "#27805f",
    "ink": "#243b50",
    "density_cmap": "YlOrBr",
    "font_size": 12,
    "figsize": (11, 9),
}


def _radial_values(func, r):
    """Allow constant scalar outputs as well as vectorized array outputs."""
    values = np.asarray(func(r), dtype=float)
    values = np.broadcast_to(values, np.shape(r))
    if not np.all(np.isfinite(values)):
        raise ValueError("The supplied function returned a non-finite value.")
    return values


def examine_gauss(field, density, radius=1.0, epsilon_0=1.0):
    """Compare charges from independent radial-density and flux formulas."""
    if (not np.isfinite(radius) or radius <= 0
            or not np.isfinite(epsilon_0) or epsilon_0 <= 0):
        raise ValueError("radius and epsilon_0 must be positive.")
    nodes, weights = np.polynomial.legendre.leggauss(48)
    r = radius * (nodes + 1) / 2
    q_density = 4 * np.pi * radius / 2 * np.sum(weights * _radial_values(density, r) * r**2)
    q_flux = epsilon_0 * 4 * np.pi * radius**2 * _radial_values(field, radius)
    print(f"Charge from density: {q_density:.8g}")
    print(f"Charge from flux:    {q_flux:.8g}")
    print(f"Absolute difference: {abs(q_density - q_flux):.3e}")
    return {"density": q_density, "flux": q_flux}


def visualize_radial_field(field, density, radius=1.0, *, style=None,
                           shell_radius=0.65, shell_width=0.08,
                           field_label=r"$\mathbf{E}=kr^3\hat{\mathbf{r}}$",
                           density_label=r"$\rho=5\epsilon_0kr^2$"):
    """Draw a cutaway for vectorized radial functions, with lengths in units of R.

    shell_radius and shell_width are fractions of R. The displayed shell has
    finite thickness; 4*pi*r**2*dr denotes its differential-volume limit.
    """
    if (not np.isfinite(radius) or radius <= 0
            or not (0 < shell_radius < shell_radius + shell_width < 1)):
        raise ValueError("Require R > 0 and 0 < shell_radius < shell_radius + shell_width < 1.")
    theme = {**RADIAL_STYLE, **(style or {})}
    samples = np.linspace(0, radius, 201)
    rho_values = _radial_values(density, samples)
    rho_min = min(0.0, float(np.min(rho_values)))
    rho_max = max(0.0, float(np.max(rho_values)))
    norm = colors.Normalize(rho_min, rho_max if rho_max > rho_min else rho_min + 1)
    cmap = plt.get_cmap(theme["density_cmap"])
    field_scale = float(np.max(np.abs(_radial_values(field, samples)))) or 1.0

    with plt.rc_context({"font.family": "DejaVu Sans",
                         "grid.color": (0.55, 0.63, 0.70, 0.35), "grid.linewidth": 0.6,
                         "font.size": theme["font_size"]}):
        fig = plt.figure(figsize=theme["figsize"], facecolor="white")
        ax = fig.add_axes([0.04, 0.18, 0.92, 0.72], projection="3d",
                          computed_zorder=False)

        # Remove the front quadrant only for visibility; the physical volume is intact.
        phi, theta = np.meshgrid(np.linspace(0, 1.5 * np.pi, 100),
                                 np.linspace(0, np.pi, 75))
        sphere = (np.sin(theta) * np.cos(phi),
                  np.sin(theta) * np.sin(phi), np.cos(theta))
        ax.plot_surface(*sphere, color=theme["sphere"], alpha=0.22,
                        linewidth=0, antialiased=True, zorder=2)

        # Color the two exposed half-disks by the volume density at each point.
        r, disk_angle = np.meshgrid(np.linspace(0, 1, 100), np.linspace(0, np.pi, 160))
        t, disk_z = r * np.sin(disk_angle), r * np.cos(disk_angle)
        facecolors = cmap(norm(_radial_values(density, radius * r)))
        band = (r >= shell_radius) & (r <= shell_radius + shell_width)
        facecolors[band] = colors.to_rgba(theme["shell"])
        for x_face, y_face in [(t, np.zeros_like(t)),
                                (np.zeros_like(t), -t)]:
            ax.plot_surface(x_face, y_face, disk_z, facecolors=facecolors,
                            rstride=1, cstride=1, shade=False,
                            linewidth=0, antialiased=False, zorder=3)

        # Draw the radial shell as smooth surfaces, with colored edges at the cut.
        edge_angle = np.linspace(0, np.pi, 180)
        for r_shell in (shell_radius, shell_radius + shell_width):
            ax.plot_surface(*(r_shell * value for value in sphere),
                            color=theme["shell"], alpha=0.16,
                            linewidth=0, zorder=4)
            for angle in (0, -np.pi / 2):
                ax.plot(r_shell * np.sin(edge_angle) * np.cos(angle),
                        r_shell * np.sin(edge_angle) * np.sin(angle),
                        r_shell * np.cos(edge_angle),
                        color=theme["shell"], linewidth=1.5, zorder=5)

        # Boundary arcs make the cutaway silhouette legible without a wire mesh.
        for angle in (0, -np.pi / 2):
            ax.plot(np.sin(edge_angle) * np.cos(angle),
                    np.sin(edge_angle) * np.sin(angle), np.cos(edge_angle),
                    color=theme["field"], linewidth=1.1, alpha=0.8, zorder=5)

        def draw_arrows(points):
            radii = np.linalg.norm(points, axis=1)
            field_values = _radial_values(field, radius * np.clip(radii, 0, 1))
            lengths = 0.34 * field_values / field_scale
            vectors = lengths[:, None] * points / radii[:, None]
            ax.quiver(*points.T, *vectors.T, color=theme["field"],
                      normalize=False, arrow_length_ratio=0.25,
                      linewidth=1.7, zorder=7)

        # Interior arrows occupy the exposed quadrant; all anchors satisfy r <= R.
        angles = np.linspace(-1.35, -0.22, 4)
        unit = np.column_stack((np.cos(angles), np.sin(angles), np.zeros(4)))
        for r_arrow in (0.4, 0.7, 1.0):
            draw_arrows(r_arrow * unit)
        surface_points = []
        for polar, azimuth in [(0.6, -2.0), (1.0, -2.5), (1.5, -2.3),
                               (2.0, -2.0), (2.7, -1.0), (0.5, -0.4)]:
            surface_points.append([np.sin(polar) * np.cos(azimuth),
                                   np.sin(polar) * np.sin(azimuth), np.cos(polar)])
        draw_arrows(np.array(surface_points))

        # Outward normal is geometric and does not reverse when the charge changes sign.
        patch_phi, patch_theta = np.meshgrid(np.linspace(-2.22, -1.98, 10),
                                             np.linspace(0.86, 1.06, 10))
        ax.plot_surface(np.sin(patch_theta) * np.cos(patch_phi),
                        np.sin(patch_theta) * np.sin(patch_phi), np.cos(patch_theta),
                        color=theme["normal"], shade=False, zorder=8)
        normal = np.array([np.sin(0.96) * np.cos(-2.1),
                           np.sin(0.96) * np.sin(-2.1), np.cos(0.96)])
        ax.quiver(*normal, *(0.53 * _radial_values(field, radius) / field_scale * normal),
                  color=theme["field"], linewidth=2.1,
                  arrow_length_ratio=0.2, zorder=8)
        ax.quiver(*normal, *(0.22 * normal), color=theme["normal"],
                  linewidth=2.4, arrow_length_ratio=0.25, zorder=9)
        ax.text(*((1.43 * normal) + [-0.13, 0, 0.02]),
                r"$d\mathbf{a}=\hat{\mathbf{r}}\,dS$", color=theme["normal"], zorder=10)
        ax.text(0, 0, 0.05, "O", color=theme["ink"], zorder=10)

        ax.set(xlim=(-1.42, 1.42), ylim=(-1.42, 1.42), zlim=(-1.42, 1.42),
               xlabel=r"$x/R$", ylabel=r"$y/R$", zlabel=r"$z/R$")
        for axis in (ax.xaxis, ax.yaxis, ax.zaxis):
            axis.set_ticks([-1, -0.5, 0, 0.5, 1])
            axis.set_pane_color((0.95, 0.97, 0.98, 0.6))
        ax.grid(True)
        ax.set_proj_type("ortho")
        ax.set_box_aspect((1, 1, 1))
        ax.view_init(elev=23, azim=-52)
        shell_x = shell_radius + shell_width / 2
        anchor_x, anchor_y, _ = proj3d.proj_transform(shell_x, 0, 0.1, ax.get_proj())
        ax.annotate("Thin shell\n" + r"$r\ \to\ r+\Delta r$",
                    xy=(anchor_x, anchor_y), xycoords="data",
                    xytext=(0.73, 0.84), textcoords="axes fraction",
                    color=theme["ink"], fontsize=11,
                    arrowprops={"arrowstyle": "->", "color": theme["shell"], "lw": 1.1},
                    bbox={"facecolor": "white", "edgecolor": "none", "alpha": 0.85, "pad": 3},
                    zorder=11)
        fig.suptitle("Radial Field and Charge: a Gaussian-Sphere Cutaway", y=0.97,
                     fontsize=17, color=theme["ink"])
        fig.text(0.5, 0.915, field_label + "     |     " + density_label,
                 ha="center", fontsize=15, color=theme["ink"])
        fig.text(0.08, 0.13, r"Shell:  $d\tau_{\mathrm{shell}}=4\pi r^2\,dr$"
                 "\n" + r"$Q=4\pi\int_0^R\rho(r)r^2\,dr$",
                 color=theme["shell"], fontsize=13, va="top")
        fig.text(0.57, 0.13, r"Flux:  $E_r(R)$ is constant on the sphere"
                 "\n" + r"$Q=\epsilon_0\,4\pi R^2E_r(R)$",
                 color=theme["field"], fontsize=13, va="top")
        fig.text(0.5, 0.025, "The cutaway is visual only: both integrals use the full sphere. "
                 "The blue surface is not a material boundary.",
                 ha="center", fontsize=10, color=theme["ink"])
    return fig, ax


if __name__ == "__main__":
    # Dimensionless demonstration: epsilon_0 = k = R = 1.
    epsilon_0 = 1.0
    k = 1.0
    def field(r):
        return k * np.asarray(r)**3

    def density(r):
        return 5 * epsilon_0 * k * np.asarray(r)**2
    examine_gauss(field, density, epsilon_0=epsilon_0)
    fig, ax = visualize_radial_field(field, density)
    plt.show()
