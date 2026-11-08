---
id: question-mw22t16e-gtwx
subject: Physics
topic: Electrodynamics
---
> [!note] Key Questions & Insights
> **Key questions**
> 1. What happens when a neutral atom is placed in an electric field?
> 2. How do microscopic dipole moments give rise to macroscopic polarization in a dielectric?
> 3. How do dielectrics and conductors respond differently to an electric field?
>
> **Key insights**
> 1. **Microscopic response:** A field can induce dipoles or reorient permanent ones.
> 2. **Directional dependence:** Polarizability can be anisotropic, so $\mathbf p$ need not be parallel to $\mathbf E$.
> 3. **Macroscopic polarization:** $\mathbf P$ is dipole moment per unit volume.

In this note, I focus on how individual atoms and molecules respond to an electric field, and how these microscopic responses produce polarization in a dielectric.
## Neutral Atom in an Electric Field
I'll start with the first question:

> *What happens when a neutral atom is placed in an electric field?*

My first instinct was “nothing”—after all, the atom is neutral. There is a useful piece of intuition here: in a uniform field, the net external force on a neutral atom is zero. But this does not mean that its internal charge distribution remains unchanged, or that a dielectric has no macroscopic response.
### Visualization
A neutral atom has internal structure: a positively charged nucleus surrounded by a negatively charged electron cloud.

Here I use a simple classical model. The nucleus is a point charge $+q$, and the electron cloud is a rigid, uniformly charged sphere of radius $a$ and total charge $-q$, where $q>0$. A quantum description of the electron distribution is outside the scope of this note.

When an external field is applied, it pushes the nucleus along the field and the electron cloud in the opposite direction. Their mutual attraction opposes this relative displacement. In a sufficiently weak field, the two effects balance at a new equilibrium, leaving the centers of positive and negative charge slightly separated.

This separation produces an **induced dipole moment**. The field induces the displacement and the dipole moment; the attraction between the nucleus and the electron cloud already exists.
```qa-demo
atomic-polarization
```
A sufficiently strong field can ionize an atom. By creating mobile charge carriers, ionization can make an initially insulating material conductive. This strong-field process goes beyond the weak-field polarization discussed below.
### Calculations
Using SI units, let $\mathbf x_0$ be the center of the electron cloud. Define $\mathbf d$ as the displacement from the cloud center to the nucleus, with $d=|\mathbf d|<a$.

We first calculate the field $\mathbf E_e$ produced by the electron cloud alone. For a spherical Gaussian surface centered at $\mathbf x_0$, with radius $0<d<a$,
$$
\oint_{\partial B_d(\mathbf x_0)}
\mathbf E_e\cdot d\mathbf a
=
\frac{Q_{\mathrm{enc}}}{\epsilon_0}.
$$
Because the charge density is uniform, the enclosed cloud charge is proportional to the enclosed volume:
$$
Q_{\mathrm{enc}}
=
-q\frac{\operatorname{Vol}(B_d)}{\operatorname{Vol}(B_a)}
=
-q\frac{d^3}{a^3}.
$$
Spherical symmetry then gives
$$
\mathbf E_e
=
-\frac{q}{4\pi\epsilon_0a^3}\mathbf d.
$$
The negative sign indicates that the cloud field at the nucleus points back toward the cloud center.

Let $\mathbf E$ denote the applied field, assumed uniform over the atom. At equilibrium, the net force on the nucleus vanishes:
$$
q(\mathbf E+\mathbf E_e)=\mathbf0.
$$
Therefore,
$$
\mathbf E
=
\frac{q}{4\pi\epsilon_0a^3}\mathbf d.
$$
Using $\mathbf p=q\mathbf d$, we obtain
$$
\mathbf p
=
(4\pi\epsilon_0a^3)\mathbf E.
$$
The coefficient relating the induced dipole moment to the field is the **atomic polarizability**, $\alpha$:
$$
\mathbf p=\alpha\mathbf E,
\qquad
\alpha=4\pi\epsilon_0a^3.
$$
Within this rigid, uniform-cloud model, the relation is exact while the nucleus remains inside the cloud. For real atoms, a linear relation is generally an approximation valid for sufficiently weak fields, and the value of $\alpha$ depends on the atom's internal structure.
## Molecules in an Electric Field
Molecules introduce two further possibilities: their response can depend on direction, and they may already possess a permanent dipole moment.

I'll use carbon dioxide, $\mathrm{CO_2}$, as an example of a nonpolar molecule, and water, $\mathrm{H_2O}$, as an example of a polar molecule.
### Nonpolar Molecules
A nonpolar molecule has no permanent dipole moment, but an applied field can still induce one.
``` qa-demo
co2-polarization
```
Carbon dioxide is linear, and it polarizes more readily along its molecular axis than perpendicular to it. Griffiths gives the approximate values
$$
\alpha_\parallel
=
4.5\times10^{-40}\,\mathrm{C^2\,m/N},
\qquad
\alpha_\perp
=
2.0\times10^{-40}\,\mathrm{C^2\,m/N}.
$$
Resolving the field into components parallel and perpendicular to the molecular axis gives
$$
\mathbf p
=
\alpha_\parallel\mathbf E_\parallel
+
\alpha_\perp\mathbf E_\perp.
$$
Because these two components are multiplied by different coefficients, the induced dipole moment need not point in the same direction as the field.

For a fixed molecular orientation, the general linear response can be written as
$$
\mathbf p=\boldsymbol{\alpha}\mathbf E,
$$
or, in components,
$$
\begin{pmatrix}
p_x\\
p_y\\
p_z
\end{pmatrix}
=
\begin{pmatrix}
\alpha_{xx}&\alpha_{xy}&\alpha_{xz}\\
\alpha_{yx}&\alpha_{yy}&\alpha_{yz}\\
\alpha_{zx}&\alpha_{zy}&\alpha_{zz}
\end{pmatrix}
\begin{pmatrix}
E_x\\
E_y\\
E_z
\end{pmatrix}.
$$
The components $\alpha_{ij}$ form the molecule's **polarizability tensor**. In a chosen coordinate system, this tensor is represented by a $3\times3$ matrix. It describes how each field component contributes to each component of the induced dipole moment.
### Polar Molecules
Some molecules have a permanent dipole moment even in the absence of an applied field.

In a water molecule, electron density is concentrated more strongly toward the oxygen atom. Together with the molecule's bent geometry—an angle of about $105^\circ$—this produces a negative end near the oxygen and a positive end on the hydrogen side.

What happens when such a molecule is placed in an electric field?
```qa-demo
water-dipole
```
To examine the force and torque, represent a permanent dipole by charges $\pm q$, separated by a vector $\mathbf d$ pointing from the negative charge to the positive charge. Its dipole moment is $\mathbf p=q\mathbf d$.
1. **Uniform field**
   The forces on the two charges cancel, so the net force is zero. However, the dipole experiences a torque about its center:$$\mathbf N=\mathbf p\times\mathbf E.$$This torque tends to align the dipole with the field. Zero net force therefore does not imply that nothing happens: the molecule can rotate.
2. **Nonuniform field**
   The field at the positive end differs from the field at the negative end, so the forces need not cancel:$$\mathbf F=q\left[\mathbf E(\mathbf r_+)-\mathbf E(\mathbf r_-)\right]=q\,\Delta\mathbf E,$$where $\mathbf r_\pm$ are the positions of the two charges. If the field varies slowly over the dipole's length, a first-order expansion gives, for example,$$\Delta E_x\approx(\nabla E_x)\cdot\mathbf d,$$with corresponding expressions for the other components. In vector notation,$$
   \Delta\mathbf E
   \approx
   (\mathbf d\cdot\nabla)\mathbf E.
   $$Hence,$$\mathbf F\approx(\mathbf p\cdot\nabla)\mathbf E.$$The spatial derivatives act on the field. The approximation requires the dipole to be small compared with the distance over which the field changes appreciably; being “atomic in size” is not sufficient by itself.

For an ideal point dipole, these expressions give the force and the torque about its own center, with the field evaluated at the dipole's position.

Polar molecules can also acquire an additional induced dipole moment. Induction and reorientation are therefore distinct responses that can coexist in the same molecule.
## Dielectric Material in an Electric Field
We can now return to the macroscopic question:

> *What happens to a piece of dielectric material when it is placed in an electric field?*

```qa-demo
dielectric-dipoles
```
There are two main contributions:
- **Induced dipoles:** the field slightly displaces the positive and negative charge distributions within atoms or molecules.
- **Orientational polarization:** the field exerts torques on permanent molecular dipoles, biasing their orientations toward alignment.

For isotropic atoms, the induced dipole moment is parallel to the field. Individual anisotropic molecules need not behave this way. If their orientations are randomly distributed, transverse contributions can cancel in the average; an oriented material requires more care.

Thermal motion competes with orientational alignment, so the alignment is generally partial at finite temperature. In ordinary polar dielectrics, this orientational contribution tends to relax after the field is removed. Some materials can retain polarization, so its disappearance is not a universal rule.

Both mechanisms can produce the same macroscopic result:

> **The material acquires a nonzero average dipole moment per unit volume—it becomes polarized.**

We describe this using the **polarization vector** $\mathbf P$:
$$
\mathbf P
\equiv
\text{dipole moment per unit volume}.
$$
For a small averaging volume $\Delta\mathcal V$ containing many molecules,
$$
\mathbf P(\mathbf r)
\approx
\frac{1}{\Delta\mathcal V}
\sum_{i\in\Delta\mathcal V}\mathbf p_i.
$$
The averaging volume is small on the macroscopic scale but large enough to contain many microscopic dipoles. In SI units, $\mathbf P$ has units of $\mathrm{C/m^2}$.

Each molecule responds to its **local field**, including contributions from its surroundings. This field should not automatically be identified with the externally applied field.

This also clarifies the distinction between dielectrics and conductors. In a dielectric, charges remain bound but can shift or reorient. In a conductor, mobile charges can redistribute over macroscopic distances until the total field inside the conducting material vanishes in electrostatic equilibrium. A polarized dielectric generally retains a nonzero internal field.
## Source
Griffiths, *Introduction to Electrodynamics*, 4th edition (2013), Sections 4.1.2–4.1.4 and Example 4.1, printed pp. 167–173.