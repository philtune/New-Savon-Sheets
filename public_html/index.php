<title>Savon Sheets</title>
<link rel="stylesheet" href="styles.css"/>

<div id="recipe_btns"></div>
<div class="container">
	<div class="col">
		<div>
			<fieldset>
				<table style="width:100%">
					<?php foreach ( [
						                [
							                'label'        => 'Weight Unit',
							                'registry_key' => 'settings.weight_unit',
							                'elem'         => 'SELECT',
										],
						                [
							                'label'        => 'Cure Days',
							                'registry_key' => 'settings.cure_days',
										],
						                [
							                'label'        => 'NaOH Percent',
							                'registry_key' => 'settings.naoh_percent',
							                'props'        => 'step="0.05" min="0" max="1"',
						                ],
						                [
							                'label'        => 'KOH Percent',
							                'registry_key' => 'settings.koh_percent',
							                'props'        => 'step="0.05" min="0" max="1"',
						                ],
						                [
							                'label'        => 'NaOH Purity',
							                'registry_key' => 'settings.naoh_purity',
							                'props'        => 'step="0.05" min="0" max="1"',
						                ],
						                [
							                'label'        => 'KOH Purity',
							                'registry_key' => 'settings.koh_purity',
							                'props'        => 'step="0.05" min="0" max="1"',
						                ],
						                [
							                'label'        => 'Lye Discount',
							                'registry_key' => 'settings.lye_discount',
							                'props'        => 'step="0.01" min="0" max="1"',
						                ],
						                [
							                'label'        => 'Batch Made Date',
							                'registry_key' => 'made_at',
											'type'         => 'text',
						                ],
						                [
							                'label'        => 'Batch Cure Date',
							                'registry_key' => 'cured_at',
											'type'         => 'text',
						                ],
					                ] as $field ) :  ?>
						<tr>
							<td><?= $field['label'] ?></td>
							<td>
								<label class="field">
									<?php if ( ($field['elem'] ?? null) === 'SELECT' ) : ?>
										<select class="input" data-input="<?= $field['registry_key'] ?>" <?= $field['props'] ?? '' ?>></select>
									<?php else : ?>
										<input class="input" type="<?= $field['type'] ?? 'number' ?>" data-input="<?= $field['registry_key'] ?>" <?= $field['props'] ?? '' ?> value=""/>
									<?php endif ?>
									<output class="output" data-output="<?= $field['registry_key'] ?>"></output>
								</label>
							</td>
						</tr>
					<?php endforeach ?>
				</table>
			</fieldset>
		</div>
		<code><i><b>recipe</b>.calc.children</i> => <span id="output1"></span></code>
	</div>
	<div class="col">
		<code><i><b>recipe</b>.calc.data</i> => <span id="output2"></span></code>
	</div>
	<div class="col">
		<code><i><b>recipe2</b>.calc.data</i> => <span id="output3"></span></code>
	</div>
</div>

<script src="../src/master.js" type="module"></script>
<!--<script src="js/master.js"></script>-->
