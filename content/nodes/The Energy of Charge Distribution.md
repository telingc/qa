---
id: question-mv4vbia6-pmmj
subject: Physics
topic: Electrodynamics
---
## Discrete Distribution
From former discussions, the concept of potential indicates that$$W=\displaystyle \int_{\mathbf{a}}^\mathbf{b}\mathbf{F}\cdot d\,\mathbf{l}=Q\displaystyle \int_{\mathbf{a}}^\mathbf{b}\mathbf{E}\cdot d\,\mathbf{l}=Q[V(\mathbf{b})-V(\mathbf{a})]$$The total work necessary to assemble charges is$$W=\displaystyle{\frac{1}{4\pi\epsilon_0}\sum_{j=1}^{n}\sum_{j>i}^n}\frac{q_iq_j}{r_{ij}}=\frac{1}{8\pi\epsilon_0}\sum_{j=1}^{n}\sum_{j\neq i}^n\frac{q_iq_j}{r_{ij}}=\frac{1}{2}\sum_{j=1}^{n}q_j\sum_{j\neq i}^n\frac{1}{4\pi\epsilon_0}\frac{q_i}{r_{ij}}$$Thus we can calculate the equation above as $\displaystyle{W=\frac{1}{2}\sum_{j=1}^{n} q_j V(r_{i})}$ , when we write this equation into integral form, it would be $\displaystyle{W}=\frac{1}{2}\int_\mathcal{V}\rho V\, d\, \tau$ . From the differential form of Gauss' law $\displaystyle \nabla\cdot \mathbf{E}=\frac{\rho}{\epsilon_0}$ , we can infer that $$\displaystyle{W}=\frac{1}{2}\int_\mathcal{V}\rho V\, d\, \tau=\frac{\epsilon_0}{2}\int_\mathcal{V}(\nabla\cdot\mathbf{E}) V\, d\, \tau$$also we can use integration by parts:$$\displaystyle{W}=\frac{\epsilon_0}{2}\int_\mathcal{V}(\nabla\cdot\mathbf{E}) V\, d\, \tau=\frac{\epsilon_0}{2}[\int_\mathcal{V}\mathbf{E} \cdot(\nabla V)\, d\, \tau+\oint_\mathcal{S}V\mathbf{E}\cdot d\,\mathbf{a}]$$Here $\mathcal V$ and $\mathcal S$ stands for the exact volume of the charge is located, but it could be enlarged since the extra territory has zero charge density. the work is zero. Thus we get:$$W=\displaystyle \frac{\epsilon_0}{2}\int_{\text{all space}}E^2d\,\tau$$
## Inconsistency
1. $W=\displaystyle \frac{\epsilon_0}{2}\int_{\text{all space}}E^2d\,\tau$ : Containing the self energy of the charges. ==For continuous situations==
2. $\displaystyle{W=\frac{1}{2}\sum_{i=1}^{n} q_i V(r_{i})}$ : Contradictory. ==For discrete situations==
Notice that if we calculate the energy of an ideal point charge using the first integral, it would be infinite.
## Energy Storage
Currently we view it as storing in charges, otherwise we have no idea.
## Doesn't Obey Superposition Principle
The energy of a compound system is not the sum of the energies of its parts considered separately—there are also “cross terms”. For example, if you double the charge everywhere, you quadruple the total energy.