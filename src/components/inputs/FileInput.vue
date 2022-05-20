<template>
  <div class="container">
    <label class="label" :class="{ label_error: error }">
      <!-- <input @change.stop="filesChanged" type="file" /> -->
      <input
        @change="filesChanged"
        type="file"
        :required="required"
        :multiple="multiple"
        :name="name"
        :accept="accept"
      />
      <span
        class="upload"
        role="button"
        type="button"
        :class="{ upload_error: error }"
        >{{ text }}</span
      >
      <span class="filename" :class="{ filename_filed: files }">{{
        files ? fileNames : placeholder
      }}</span>
    </label>
    <aside>{{ error }}</aside>
  </div>
</template>

<style lang="scss" scoped>
@import url("https://fonts.googleapis.com/css2?family=Asap:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap");
.container {
  display: flex;
  flex-direction: column;
  position: relative;

  .label {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 54px;

    border: 1px solid #d0cfcf;
    border-radius: 4px;

    font-family: "Nunito";
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 26px;
    cursor: pointer;

    input {
      display: none;
    }
    .upload {
      border: 1px solid rgba(0, 0, 0, 0.87);
      border-radius: 4px 0px 0px 4px;

      color: rgba(0, 0, 0, 0.87);

      padding: 14px;
      box-sizing: border-box;

      margin: -1px 0 0 -1px;
      height: calc(100% + 2px);

      &__error {
        margin: -2px 0 0 -2px;
        height: calc(100% + 4px);
        border: 2px solid #cb3d40;
      }
    }
    .filename {
      padding: 14px;
      box-sizing: border-box;
      color: #7e7e7e;

      height: 100%;

      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &_filed {
        color: rgba(0, 0, 0, 0.87);
      }
    }
    &_error {
      border: 2px solid #cb3d40;
    }
    &_file {
      font-family: "Nunito";
      font-style: normal;
      font-weight: 400;
      font-size: 16px;
      line-height: 26px;

      color: rgba(0, 0, 0, 0.87);
    }
  }

  aside {
    font-family: "Asap";
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 14px;

    color: #cb3d40;
    position: absolute;
    top: calc(100% + 2 * 2px + 4px);
    left: 16px;
  }
}
</style>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FileInput",
  emits: ["change"],
  props: {
    placeholder: String,
    text: String,
    name: String,
    error: String,
    modelValue: String,
    required: Boolean,
    multiple: Boolean,
    accept: String,
  },

  data() {
    return {
      files: null as FileList | null,
      arr: [],
      val: 16,
    };
  },
  computed: {
    fileNames() {
      let files = [];
      if (this.files) {
        for (let i = 0; i < this.files.length; i++) {
          files.push(this.files[i].name);
        }
      }
      return files.join(", ");
    },
  },
  methods: {
    filesChanged(event: MouseEvent) {
      if (event?.target instanceof HTMLInputElement) {
        this.files = event.target.files;
        this.$emit("change", event.target.files);
      }
    },
  },
});
</script>
