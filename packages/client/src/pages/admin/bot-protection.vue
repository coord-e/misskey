<template>
<div>
	<FormSuspense :p="init">
		<div class="_formRoot">
			<FormRadios v-model="provider" class="_formBlock">
				<option :value="null">{{ $ts.none }} ({{ $ts.notRecommended }})</option>
				<option value="hcaptcha">hCaptcha</option>
				<option value="recaptcha">reCAPTCHA</option>
			</FormRadios>

			<template v-if="provider === 'hcaptcha'">
				<FormInput v-model="hcaptchaSiteKey" class="_formBlock">
					<template #prefix><i class="fas fa-key"></i></template>
					<template #label>{{ $ts.hcaptchaSiteKey }}</template>
				</FormInput>
				<FormInput v-model="hcaptchaSecretKey" class="_formBlock">
					<template #prefix><i class="fas fa-key"></i></template>
					<template #label>{{ $ts.hcaptchaSecretKey }}</template>
				</FormInput>
				<FormSlot class="_formBlock">
					<template #label>{{ $ts.preview }}</template>
					<MkCaptcha provider="hcaptcha" :sitekey="hcaptchaSiteKey || '10000000-ffff-ffff-ffff-000000000001'"/>
				</FormSlot>
			</template>
			<template v-else-if="provider === 'recaptcha'">
				<FormInput v-model="recaptchaSiteKey" class="_formBlock">
					<template #prefix><i class="fas fa-key"></i></template>
					<template #label>{{ $ts.recaptchaSiteKey }}</template>
				</FormInput>
				<FormInput v-model="recaptchaSecretKey" class="_formBlock">
					<template #prefix><i class="fas fa-key"></i></template>
					<template #label>{{ $ts.recaptchaSecretKey }}</template>
				</FormInput>
				<FormSlot v-if="recaptchaSiteKey" class="_formBlock">
					<template #label>{{ $ts.preview }}</template>
					<MkCaptcha provider="recaptcha" :sitekey="recaptchaSiteKey"/>
				</FormSlot>
			</template>

			<FormButton primary @click="save"><i class="fas fa-save"></i> {{ $ts.save }}</FormButton>
		</div>
	</FormSuspense>
</div>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
import FormRadios from '@/components/form/radios.vue';
import FormInput from '@/components/form/input.vue';
import FormButton from '@/components/ui/button.vue';
import FormSuspense from '@/components/form/suspense.vue';
import FormSlot from '@/components/form/slot.vue';
import * as os from '@/os';
import { fetchInstance } from '@/instance';

const MkCaptcha = defineAsyncComponent(() => import('@/components/captcha.vue'));

let provider = $ref(null);
let hcaptchaSiteKey: string | null = $ref(null);
let hcaptchaSecretKey: string | null = $ref(null);
let recaptchaSiteKey: string | null = $ref(null);
let recaptchaSecretKey: string | null = $ref(null);

async function init() {
	const meta = await os.api('admin/meta');
	hcaptchaSiteKey = meta.hcaptchaSiteKey;
	hcaptchaSecretKey = meta.hcaptchaSecretKey;
	recaptchaSiteKey = meta.recaptchaSiteKey;
	recaptchaSecretKey = meta.recaptchaSecretKey;

	provider = meta.enableHcaptcha ? 'hcaptcha' : meta.enableRecaptcha ? 'recaptcha' : null;
}

function save() {
	os.apiWithDialog('admin/update-meta', {
		enableHcaptcha: provider === 'hcaptcha',
		hcaptchaSiteKey,
		hcaptchaSecretKey,
		enableRecaptcha: provider === 'recaptcha',
		recaptchaSiteKey,
		recaptchaSecretKey,
	}).then(() => {
		fetchInstance();
	});
}
</script>
